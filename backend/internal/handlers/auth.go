package handlers

import (
    "net/http"
    "github.com/gin-gonic/gin"
    "github.com/Deeks779/balkanid-file-vault/backend/internal/db"
    "github.com/Deeks779/balkanid-file-vault/backend/internal/utils"
)

type Credentials struct {
    Username string `json:"username"`
    Email    string `json:"email,omitempty"`
    Password string `json:"password"`
}

func Register(c *gin.Context) {
	var creds Credentials
	if err := c.ShouldBindJSON(&creds); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	hash, _ := utils.HashPassword(creds.Password)

	_, err := db.DB.Exec(c, "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3)",
		creds.Username, creds.Email, hash)
		
	if err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "User with this username or email already exists"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "User registered"})
}

func Login(c *gin.Context) {
    var creds Credentials
    if err := c.ShouldBindJSON(&creds); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
        return
    }

    var id int
    var hash, role string
    err := db.DB.QueryRow(c, "SELECT id, password_hash, role FROM users WHERE username=$1", creds.Username).
        Scan(&id, &hash, &role)
    if err != nil || !utils.CheckPassword(hash, creds.Password) {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
        return
    }

    token, _ := utils.GenerateToken(id, role)
    c.JSON(http.StatusOK, gin.H{"token": token})
}
