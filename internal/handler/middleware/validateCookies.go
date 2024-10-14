package middleware

import (
	"fmt"
	"os"
	"shortlink/internal/handler/rest"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
)

func ValidateCookie(c *fiber.Ctx) error {
    // Retrieve token from the Authorization cookie
    cookie := c.Cookies("Authorization")
    
    // Log the cookie value for debugging
    fmt.Printf("Received Cookie: %s\n", cookie)

    if cookie == "" {
        // Log missing cookie
        fmt.Println("Authorization cookie is missing")
        return rest.Unauthorized(c, "Unauthorized, please login")
    }

    // Parse the JWT token
    token, err := jwt.Parse(cookie, func(token *jwt.Token) (interface{}, error) {
        // Ensure the signing method is HMAC
        if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
            // Log unexpected signing method
            fmt.Printf("Unexpected signing method: %v\n", token.Header["alg"])
            return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
        }
        // Use a secret key from environment variables
        secretKey := os.Getenv("SUPERDUPERMEGABIGTOPSECRETINTHISPROJECTWHYIUSETHISNAMEFORMYCODEBRUHLOL")
        return []byte(secretKey), nil
    })

    // Handle errors during token parsing
    if err != nil {
        // Log parsing error
        fmt.Printf("Error parsing token: %v\n", err)
        return rest.Unauthorized(c, "Invalid Token")
    }

    // Validate token claims
    if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
        // Check token expiration time
        if exp, ok := claims["exp"].(float64); ok {
            // Compare expiration time with the current time
            if time.Unix(int64(exp), 0).Before(time.Now()) {
                // Log token expiration
                fmt.Println("Token has expired")
                return rest.Unauthorized(c, "Expired Token")
            }
        } else {
            // Log missing expiration claim
            fmt.Println("Expiration (exp) claim is missing")
        }
        // Store the full token in the context
        c.Locals("user", token)
    } else {
        // Log invalid token
        fmt.Println("Invalid token claims or token is not valid")
        return rest.Unauthorized(c, "Invalid Token")
    }

    // Call the next handler
    return c.Next()
}
