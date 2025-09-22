package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/Deeks779/balkanid-file-vault/backend/internal/db"
)

func EnforceQuota() gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			return
		}

		var quota int64
		err := db.DB.QueryRow(c, "SELECT storage_quota FROM users WHERE id=$1", userID).Scan(&quota)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Could not retrieve user quota"})
			return
		}
		if quota <= 0 {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"error": "You have exceeded your storage limit. No space left.",
				"quota": quota,
			})
			return
		}
		form, err := c.MultipartForm()
		if err != nil {
			c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "Invalid form data"})
			return
		}

		var incomingSize int64 = 0
		if files, ok := form.File["files"]; ok {
			for _, f := range files {
				incomingSize += f.Size
			}
		}

		if incomingSize > quota {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"error":     "Upload size exceeds available storage quota",
				"quota":     quota,
				"incoming":  incomingSize,
			})
			return
		}

		_, err = db.DB.Exec(c, "UPDATE users SET storage_quota = storage_quota - $1 WHERE id=$2", incomingSize, userID)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user quota1"})
			return
		}

		c.Next()
	}
}