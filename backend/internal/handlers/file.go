package handlers

import (
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/Deeks779/balkanid-file-vault/backend/internal/db"
	"github.com/Deeks779/balkanid-file-vault/backend/internal/utils"
	"github.com/gin-gonic/gin"
)

// Uploading file function
func UploadFile(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
		return
	}

	form, err := c.MultipartForm()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid upload"})
		return
	}

	files := form.File["files"]
	if len(files) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No files uploaded"})
		return
	}

	var savedFiles []map[string]interface{}

	for _, file := range files {
		// Save temporarily
		savePath := filepath.Join("uploads", file.Filename)
		if err := c.SaveUploadedFile(file, savePath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
			return
		}

		// Compute hash
		hash, err := utils.FileHash(savePath)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash file"})
			return
		}

		// Check deduplication
		var existingID int
		var refCount int
		var size int64
		query := `SELECT id, ref_count, size FROM files WHERE hash=$1 AND user_id=$2`
		err = db.DB.QueryRow(c, query, hash, userID).Scan(&existingID, &refCount, &size)

		if err == nil {
			// Duplicate found → increment ref_count
			_, err = db.DB.Exec(c, "UPDATE files SET ref_count=$1 WHERE id=$2", refCount+1, existingID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "DB update failed"})
				return
			}
			_, err = db.DB.Exec(c, "UPDATE users SET storage_quota = storage_quota + $1 WHERE id=$2", size, userID)
			if err != nil {
				c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user quota"})
				return
			}
			// Remove duplicate physical file
			os.Remove(savePath)

			savedFiles = append(savedFiles, map[string]interface{}{
				"filename": file.Filename,
				"status":   "duplicate (reference added)",
			})
			continue
		}

		// Store new file metadata
		query = `INSERT INTO files (user_id, filename, mime_type, size, hash, path) 
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`
		var id int
		err = db.DB.QueryRow(c, query,
			userID,
			file.Filename,
			file.Header.Get("Content-Type"),
			file.Size,
			hash,
			savePath).Scan(&id)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "DB insert failed"})
			return
		}

		savedFiles = append(savedFiles, map[string]interface{}{
			"id":       id,
			"filename": file.Filename,
			"status":   "uploaded",
		})
	}

	c.JSON(http.StatusOK, gin.H{"files": savedFiles})
}

// File listing endpoint function
type FileInfo struct {
	ID            int       `json:"id"`
	Filename      string    `json:"filename"`
	MimeType      string    `json:"mime_type"`
	Size          int64     `json:"size"`
	UploadDate    time.Time `json:"upload_date"`
	RefCount      int       `json:"ref_count"`
	Visibility    string    `json:"visibility"`
	DownloadCount int       `json:"download_count"`
}

func ListFiles(c *gin.Context) {
	userID, _ := c.Get("user_id")

	query := `
		SELECT id, filename, mime_type, size, upload_date, ref_count, visibility, download_count
		FROM files
		WHERE user_id=$1
		ORDER BY upload_date DESC`

	rows, err := db.DB.Query(c, query, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch files"})
		return
	}
	defer rows.Close()

	files := []FileInfo{}
	for rows.Next() {
		var file FileInfo
		if err := rows.Scan(
			&file.ID, &file.Filename, &file.MimeType, &file.Size,
			&file.UploadDate, &file.RefCount, &file.Visibility, &file.DownloadCount,
		); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan file data"})
			return
		}
		files = append(files, file)
	}

	c.JSON(http.StatusOK, gin.H{"files": files})
}

// deleting file function
func DeleteFile(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
		return
	}
	fileID := c.Param("id")

	var ownerID, refCount int
	var path string
	var size int64
	query := `SELECT user_id, path, ref_count, size FROM files WHERE id=$1`
	err := db.DB.QueryRow(c, query, fileID).Scan(&ownerID, &path, &refCount, &size)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "File not found"})
		return
	}

	if ownerID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Cannot delete another user’s file"})
		return
	}

	if refCount > 1 {
		_, err = db.DB.Exec(c, "UPDATE files SET ref_count=$1 WHERE id=$2", refCount-1, fileID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update ref_count"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"status": "reference removed"})
		return
	}

	tx, err := db.DB.Begin(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start transaction"})
		return
	}
	defer tx.Rollback(c)
	// Delete record + file
	_, err = db.DB.Exec(c, "DELETE FROM files WHERE id=$1", fileID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "DB delete failed"})
		return
	}
	_, err = tx.Exec(c, "UPDATE users SET storage_quota = storage_quota + $1 WHERE id=$2", size, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to restore user quota"})
		return
	}
	if err := tx.Commit(c); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
		return
	}

	os.Remove(path)

	c.JSON(http.StatusOK, gin.H{"status": "file deleted"})
}
