package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type limiter struct {
	tokens     int
	lastRefill time.Time
}

var (
	rateLimiters = make(map[int]*limiter)
	mu           sync.Mutex
	rate         = 2
	burst        = 2
)


func RateLimiter() gin.HandlerFunc {
	return func(c *gin.Context) {
		userIDAny, exists := c.Get("user_id")
		if !exists {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			return
		}

		userID, ok := userIDAny.(int)
		if !ok {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID type in token"})
			return
		}

		mu.Lock()
		l, exists := rateLimiters[userID] 
		if !exists {
			l = &limiter{tokens: burst, lastRefill: time.Now()}
			rateLimiters[userID] = l
		}

		now := time.Now()
		elapsed := now.Sub(l.lastRefill).Seconds()
		refill := int(elapsed * float64(rate))
		if refill > 0 {
			l.tokens += refill
			if l.tokens > burst {
				l.tokens = burst
			}
			l.lastRefill = now
		}

		if l.tokens <= 0 {
			mu.Unlock()
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error": "Rate limit exceeded. Try again later.",
			})
			return
		}

		l.tokens--
		mu.Unlock()

		c.Next()
	}
}