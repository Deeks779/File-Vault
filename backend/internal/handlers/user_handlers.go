// in a file like internal/handlers/user_handlers.go

package handlers

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"github.com/Deeks779/balkanid-file-vault/backend/internal/db"
)

func GetUserProfile(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
		return
	}

	var username, email string
	var storageQuota int64
	err := db.DB.QueryRow(c, "SELECT username, email, storage_quota FROM users WHERE id=$1", userID).Scan(&username, &email, &storageQuota)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	var totalUsed, originalSize int64
	db.DB.QueryRow(c, "SELECT COALESCE(SUM(size),0) FROM files WHERE user_id=$1", userID).Scan(&totalUsed)
	db.DB.QueryRow(c, "SELECT COALESCE(SUM(size*ref_count),0) FROM files WHERE user_id=$1", userID).Scan(&originalSize)

	savings := originalSize - totalUsed
	var percentSaved float64
	if originalSize > 0 {
		percentSaved = float64(savings) / float64(originalSize) * 100
	}

	c.JSON(http.StatusOK, gin.H{
		"user_details": gin.H{
			"username": username,
			"email":    email,
		},
		"storage_stats": gin.H{
			"total_used":   totalUsed,
			"storage_quota":  storageQuota,
			"original":     originalSize,
			"savings":      savings,
			"percent":      percentSaved,
		},
	})
}