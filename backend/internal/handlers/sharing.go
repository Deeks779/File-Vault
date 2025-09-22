package handlers

import (
	"log"
	"net/http"
	"time"

	"github.com/Deeks779/balkanid-file-vault/backend/internal/db"
	"github.com/gin-gonic/gin"
)

func UpdateVisibility(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
		return
	}
	fileID := c.Param("id")
	var newVisibility struct {
		Visibility string `json:"visibility"`
	}
	if err := c.ShouldBindJSON(&newVisibility); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid body"})
		return
	}

	// Only owner can change
	_, err := db.DB.Exec(c,
		"UPDATE files SET visibility=$1 WHERE id=$2 AND user_id=$3",
		newVisibility.Visibility, fileID, userID,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "DB update failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "updated"})
}

func PublicFile(c *gin.Context) {
	fileID := c.Param("id")

	var filename, path, visibility string
	err := db.DB.QueryRow(c,
		"SELECT filename, path, visibility FROM files WHERE id=$1", fileID,
	).Scan(&filename, &path, &visibility)

	if err != nil || visibility != "public" {
		c.JSON(http.StatusForbidden, gin.H{"error": "File not public"})
		return
	}
	_, err = db.DB.Exec(c, "UPDATE files SET download_count = download_count + 1 WHERE id=$1", fileID)
	if err != nil {
		log.Printf("Failed to update download count for file %s: %v", fileID, err)
		return
	}
	c.FileAttachment(path, filename)
}

type PublicFileInfo struct {
	Fileid     string    `json:"id"`
	Username   string    `json:"username"`
	Filename   string    `json:"filename"`
	Size       int64     `json:"size_bytes"`
	MimeType   string    `json:"mime_type"`
	UploadDate time.Time `json:"upload_date"`
}

func ListPublicFiles(c *gin.Context) {

	query := `
		SELECT
			f.id,
			u.username,
			f.filename,
			f.size,
			f.mime_type,
			f.upload_date
		FROM
			files f
		INNER JOIN
			users u ON f.user_id = u.id
		WHERE
			f.visibility = 'public'
		ORDER BY
			f.upload_date DESC;`

	rows, err := db.DB.Query(c, query)
	if err != nil {
		log.Printf("Database query error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not fetch public files"})
		return
	}
	defer rows.Close()

	var files []PublicFileInfo

	for rows.Next() {
		var file PublicFileInfo
		if err := rows.Scan(&file.Fileid, &file.Username, &file.Filename, &file.Size, &file.MimeType, &file.UploadDate); err != nil {
			log.Printf("Error scanning row: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error processing file data"})
			return
		}

		files = append(files, file)
	}

	if err := rows.Err(); err != nil {
		log.Printf("Error during rows iteration: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error reading file list"})
		return
	}

	c.JSON(http.StatusOK, files)
}

func PublicFilePreview(c *gin.Context) {
    fileID := c.Param("id")

    // Query file info
    var filename, mimeType, filepath string
    err := db.DB.QueryRow(c, "SELECT filename, mime_type, path FROM files WHERE id=$1", fileID).
        Scan(&filename, &mimeType, &filepath)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "File not found"})
        return
    }

    // Set Content-Type to allow browser to preview
    c.Header("Content-Type", mimeType)
    c.File(filepath)
}

