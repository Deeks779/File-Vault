package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/Deeks779/balkanid-file-vault/backend/internal/db"
)

func StorageStats(c *gin.Context) {
	 userID, exists := c.Get("user_id")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
        return
    }

	var total int64
	var original int64

	// Deduplicated usage
	db.DB.QueryRow(c, "SELECT COALESCE(SUM(size),0) FROM files WHERE user_id=$1", userID).Scan(&total)

	// Original usage (without dedup) – count all references
	db.DB.QueryRow(c, "SELECT COALESCE(SUM(size*ref_count),0) FROM files WHERE user_id=$1", userID).Scan(&original)

	savings := original - total
	var percent float64
	if original > 0 {
		percent = float64(savings) / float64(original) * 100
	}

	c.JSON(http.StatusOK, gin.H{
		"total_used": total,
		"original":   original,
		"savings":    savings,
		"percent":    percent,
	})
}
