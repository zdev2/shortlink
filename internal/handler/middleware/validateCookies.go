package middleware

import (
	"fmt"
	"os"
	"shortlink/internal/handler/rest"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
)

// ValidateToken checks the Authorization cookie, validates the JWT, and passes claims to the context
func ValidateToken(c *fiber.Ctx) error {
    // Retrieve token from cookies
    tokenString := c.Cookies("Authorization")
    
    // Log the retrieved token for debugging purposes
    fmt.Println("Retrieved token from cookie:", tokenString)
    
    if tokenString == "" {
        fmt.Println("Token cookie is missing")
        return rest.Unauthorized(c, "Unauthorized, please login")
    }

    // Parse the JWT token
    token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
        if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
            fmt.Printf("Unexpected signing method: %v\n", token.Header["alg"])
            return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
        }
        secretKey := os.Getenv("SUPERDUPERMEGABIGTOPSECRETINTHISPROJECTWHYIUSETHISNAMEFORMYCODEBRUHLOL")
        return []byte(secretKey), nil
    })

    if err != nil {
        fmt.Printf("Error parsing token: %v\n", err)
        return rest.Unauthorized(c, "Invalid Token")
    }

    if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
        if exp, ok := claims["exp"].(float64); ok {
            if time.Unix(int64(exp), 0).Before(time.Now()) {
                fmt.Println("Token has expired")
                return rest.Unauthorized(c, "Expired Token")
            }
        } else {
            fmt.Println("Expiration (exp) claim is missing")
        }
        fmt.Println("Token claims:", claims) // Log the claims for debugging
        c.Locals("user", claims) // Store claims instead of token if needed
    } else {
        fmt.Println("Invalid token claims or token is not valid")
        return rest.Unauthorized(c, "Invalid Token")
    }

    return c.Next()
}
