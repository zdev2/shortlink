package middleware

import (
	"fmt"
	"os"
	"shortlink/internal/handler/rest"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
)

// ValidateToken middleware
func ValidateToken(c *fiber.Ctx) error {
    // Retrieve the token from Authorization header or cookies
    tokenString := strings.TrimPrefix(c.Get("Authorization"), "Bearer ")
    if tokenString == "" {
        tokenString = strings.TrimPrefix(c.Cookies("Authorization"), "Bearer ")
    }

    fmt.Println("Token:", tokenString)

    // If token is missing, return unauthorized error
    if tokenString == "" {
        return rest.Unauthorized(c, "Unauthorized, please login")
    }

    // Retrieve secret key from environment variables
    secretKey := os.Getenv("SUPERDUPERMEGABIGTOPSECRETINTHISPROJECTWHYIUSETHISNAMEFORMYCODEBRUHLOL")
    if secretKey == "" {
        return rest.Unauthorized(c, "Server error")
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
        fmt.Println("Error parsing token:", err)
        return rest.Unauthorized(c, "Invalid Token")
    }

    // Log the type of token returned
    fmt.Printf("Parsed token: %T\n", token) // Log the type of the token object

    // Ensure the token is valid
    if !token.Valid {
        fmt.Println("Invalid token")
        return rest.Unauthorized(c, "Invalid Token")
    }

    // Check for expiration (if the exp claim exists)
    if exp, ok := claims["exp"].(float64); ok {
        if int64(exp) < time.Now().Unix() {
            return rest.Unauthorized(c, "Expired Token")
        }
    }

    // Log the claims for debugging purposes
    fmt.Println("Token claims:", claims)

    // Store the entire claims map in context for later use
    c.Locals("user", claims) // Store all claims in context

    // Proceed to the next middleware or handler
    return c.Next()
}
