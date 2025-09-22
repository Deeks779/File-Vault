package handlers

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/lib/pq"

	"github.com/Deeks779/balkanid-file-vault/backend/internal/db"
)

func SearchFiles(c *gin.Context) {
    userID, exists := c.Get("user_id")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
        return
    }

    // Query params
    filename := c.Query("filename")
    mime := c.Query("mime")
    minSize := c.Query("minSize")
    maxSize := c.Query("maxSize")
    startDate := c.Query("startDate")
    endDate := c.Query("endDate")
    tags := c.QueryArray("tags")

    base := `SELECT id, filename, mime_type, size, hash, upload_date, ref_count, visibility, download_count
             FROM files WHERE user_id=$1`
    args := []interface{}{userID}
    conditions := []string{}
    i := 2

    if filename != "" {
        conditions = append(conditions, fmt.Sprintf("filename ILIKE $%d", i))
        args = append(args, "%"+filename+"%")
        i++
    }

    if mime != "" {
        conditions = append(conditions, fmt.Sprintf("mime_type ILIKE $%d", i))
        args = append(args, "%"+mime+"%")
        i++
    }

    if minSize != "" {
        if minVal, err := strconv.ParseInt(minSize, 10, 64); err == nil {
            conditions = append(conditions, fmt.Sprintf("size >= $%d", i))
            args = append(args, minVal)
            i++
        }
    }

    if maxSize != "" {
        if maxVal, err := strconv.ParseInt(maxSize, 10, 64); err == nil {
            conditions = append(conditions, fmt.Sprintf("size <= $%d", i))
            args = append(args, maxVal)
            i++
        }
    }

    if startDate != "" {
        if t, err := time.Parse("2006-01-02", startDate); err == nil {
            conditions = append(conditions, fmt.Sprintf("upload_date >= $%d", i))
            args = append(args, t)
            i++
        }
    }

    if endDate != "" {
        if t, err := time.Parse("2006-01-02", endDate); err == nil {
            // Add +1 day so it's inclusive
            t = t.Add(24 * time.Hour)
            conditions = append(conditions, fmt.Sprintf("upload_date < $%d", i))
            args = append(args, t)
            i++
        }
    }

    if len(tags) > 0 {
        conditions = append(conditions, fmt.Sprintf("tags && $%d", i))
        args = append(args, pq.Array(tags))
        i++
    }

    if len(conditions) > 0 {
        base += " AND " + strings.Join(conditions, " AND ")
    }

    fmt.Println("🔍 Executing:", base, args)

    rows, err := db.DB.Query(c.Request.Context(), base, args...)
    if err != nil {
        fmt.Println("Query error:", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    defer rows.Close()

    var results []map[string]interface{}
    for rows.Next() {
        var id, refCount, dCount int
        var filename, mimeType, hash, vis string
        var size int64
        var uploadDate time.Time

        if err := rows.Scan(&id, &filename, &mimeType, &size, &hash, &uploadDate, &refCount, &vis, &dCount); err != nil {
            fmt.Println("Scan error:", err)
            c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
            return
        }

        results = append(results, map[string]interface{}{
            "id":             id,
            "filename":       filename,
            "mime_type":      mimeType,
            "size":           size,
            "hash":           hash,
            "uploadDate":     uploadDate,
            "ref_count":      refCount,
            "visibility":     vis,
            "download_count": dCount,
        })
    }

    c.JSON(http.StatusOK, gin.H{"results": results})
}
