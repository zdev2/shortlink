package middleware

import (
	"fmt"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
)

func ValidateCookie(c *fiber.Ctx) error {
	// Retrieve token from the cookie
	cookie := c.Cookies("Authorization")
	if cookie == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error":  "Unauthorized, please login",
			"status": fiber.StatusUnauthorized,
		})
	}

	// Parse the JWT token
	token, err := jwt.Parse(cookie, func(token *jwt.Token) (interface{}, error) {
		// Ensure the signing method is correct
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(os.Getenv("SUPERDUPERMEGABIGTOPSECRETINTHISPROJECTWHYIUSETHISNAMEFORMYCODEBRUHLOL")), nil
	})

	// Handle invalid token
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error":  "Invalid token",
			"status": fiber.StatusUnauthorized,
		})
	}

	// Validate the token claims
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		// Check token expiration
		if exp, ok := claims["exp"].(float64); ok {
			if time.Unix(int64(exp), 0).Before(time.Now()) {
				return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
					"error":  "Token expired",
					"status": fiber.StatusUnauthorized,
				})
			}
		}
		// Store the full token (not just the "sub" claim)
		c.Locals("user", token)
	} else {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error":  "Invalid token",
			"status": fiber.StatusUnauthorized,
		})
	}

	return c.Next()
}
