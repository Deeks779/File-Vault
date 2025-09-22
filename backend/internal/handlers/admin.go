package handlers

import (
	// "log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/Deeks779/balkanid-file-vault/backend/internal/db"
)

func AdminListAllFiles(c *gin.Context) {
    rows, err := db.DB.Query(c, `
        SELECT f.id, f.filename, f.mime_type, f.size, f.upload_date, f.visibility, f.download_count, u.username
        FROM files f
        LEFT JOIN users u ON f.user_id = u.id
    `)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "DB query failed"})
        return
    }
    defer rows.Close()

    var results []map[string]interface{}
    for rows.Next() {
        var id, downloadCount int
        var filename, mime, visibility string
        var size int64
        var uploadDate time.Time
        var username *string

        if err := rows.Scan(&id, &filename, &mime, &size, &uploadDate, &visibility, &downloadCount, &username); err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Scan failed"})
            return
        }

        uploader := ""
        if username != nil {
            uploader = *username
        }

        results = append(results, map[string]interface{}{
            "id":         id,
            "filename":   filename,
            "mime_type":  mime,
            "size":       size,
            "uploadDate": uploadDate.Format(time.RFC3339),
            "visibility": visibility,
			"downloadCount" :downloadCount,
            "uploader":   uploader,
        })
    }

    c.JSON(http.StatusOK, gin.H{"files": results})
}


func AdminStats(c *gin.Context) {
	var totalFiles int
	var totalStorage int64
	var totalUsers int

	db.DB.QueryRow(c, "SELECT COUNT(*) FROM files").Scan(&totalFiles)
	db.DB.QueryRow(c, "SELECT COALESCE(SUM(size),0) FROM files").Scan(&totalStorage)
	db.DB.QueryRow(c, "SELECT COUNT(*) FROM users").Scan(&totalUsers)

	c.JSON(http.StatusOK, gin.H{
		"total_files":   totalFiles,
		"total_storage": totalStorage,
		"total_users":   totalUsers,
	})
}
