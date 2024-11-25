package middleware

import (
	"fmt"
	"os"
	"shortlink/internal/utils"
	"shortlink/logger"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
)

// ValidateToken middleware
func ValidateToken(c *fiber.Ctx) error {
    log := logger.GetLogger()
    // Retrieve the token from Authorization header or cookies
    tokenString := strings.TrimPrefix(c.Get("Authorization"), "Bearer ")
    if tokenString == "" {
        tokenString = strings.TrimPrefix(c.Cookies("Authorization"), "Bearer ")
    }

    // If token is missing, return unauthorized error
    if tokenString == "" {
        log.Warning("UNAUTHORIZED", "User is Unauthorized")
        return utils.Unauthorized(c, "Unauthorized, please login")
    }

    // Retrieve secret key from environment variables
    secretKey := os.Getenv("JWT_TOKEN")
    if secretKey == "" {
        log.Warning("UNAUTHORIZED", "Server error")
        return utils.Unauthorized(c, "Server error")
    }

    // Initialize claims as MapClaims to store all claims
    claims := jwt.MapClaims{}

    // Parse the JWT token with the claims
    token, err := jwt.ParseWithClaims(tokenString, &claims, func(token *jwt.Token) (interface{}, error) {
        // Ensure the signing method is HMAC
        if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
            return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
        }
        return []byte(secretKey), nil
    })

    // Check for errors during parsing
    if err != nil {
        log.Warning("UNAUTHORIZED", "Error parsing token")
        return utils.Unauthorized(c, "Invalid Token")
    }

    // Ensure the token is valid
    if !token.Valid {
        log.Warning("UNAUTHORIZED", "User token is Invalid")
        return utils.Unauthorized(c, "Invalid Token")
    }

    // Check for expiration (if the exp claim exists)
    if exp, ok := claims["exp"].(float64); ok {
        if int64(exp) < time.Now().Unix() {
            return utils.Unauthorized(c, "Expired Token")
        }
    }

    // Store the entire claims map in context for later use
    c.Locals("user", claims) // Store all claims in context

    // Proceed to the next middleware or handler
    return c.Next()
}
