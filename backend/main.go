package main

import (
	"log"
	"time"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"github.com/Deeks779/balkanid-file-vault/backend/internal/db"
	"github.com/Deeks779/balkanid-file-vault/backend/internal/handlers"
	"github.com/Deeks779/balkanid-file-vault/backend/internal/middleware"
)

func main() {
	// Load .env
	godotenv.Load()

	// Connect DB
	if err := db.ConnectDB(); err != nil {
		log.Fatal("Failed to connect to DB:", err)
	}

	r := gin.Default()
	// CORS middleware configuration
	corsOrigin := os.Getenv("CORS_ORIGIN")
    if corsOrigin == "" {
        // Fallback for local development
        corsOrigin = "http://localhost:5173"
    }
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{corsOrigin},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Public route
	r.POST("/register", handlers.Register)
	r.POST("/login", handlers.Login)

	r.GET("/public/:id", handlers.PublicFile)
	r.GET("/preview/:id", handlers.PublicFilePreview)

	r.GET("/files/public", handlers.ListPublicFiles)

	// Protected route
	protected := r.Group("/api")
	protected.Use(middleware.AuthRequired(), middleware.RateLimiter())

	{
		protected.GET("/ping", func(c *gin.Context) {
			c.JSON(200, gin.H{"message": "pong (protected)"})
		})
		protected.POST("/upload", middleware.EnforceQuota(), handlers.UploadFile)
		protected.GET("/files", handlers.ListFiles)
		protected.DELETE("/files/:id", handlers.DeleteFile)
		protected.GET("/search", handlers.SearchFiles)
		protected.GET("/profile", handlers.GetUserProfile)
		protected.PUT("/files/:id/visibility", handlers.UpdateVisibility)

	}

	// Admin routes
	admin := r.Group("/admin")
	admin.Use(middleware.AuthRequired(), middleware.AdminOnly())
	{
		admin.GET("/files", handlers.AdminListAllFiles)
		admin.GET("/stats", handlers.AdminStats)
	}

	log.Println("Server running on :8080")
	r.Run(":8080")
}
