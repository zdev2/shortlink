package middleware

import (
	"context"
	"fmt"
	"shortlink/internal/database"
	"shortlink/model"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func AuditMiddleware(action, entity string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Call the next handler (perform the main action like GET, POST, etc.)
		err := c.Next()

		// After the main handler has processed the request, proceed to log the audit action
		if err == nil {
			// Retrieve user from context (assuming ValidateCookie has been applied earlier)
			userToken := c.Locals("user").(*jwt.Token)
			claims := userToken.Claims.(jwt.MapClaims)
			userID, _ := primitive.ObjectIDFromHex(claims["sub"].(string))

			// Create audit log entry
			auditLog := model.AuditLog{
				ID:        primitive.NewObjectID(),
				UserID:    userID,
				Action:    action,
				Entity:    entity,
				EntityID:  c.Params("id", ""), // Extract entity ID from route parameter, default to empty
				Timestamp: time.Now(),
				IPAddress: c.IP(),
			}

			// Save audit log to MongoDB
			collection := database.MongoClient.Database("shortlink").Collection("audit_log")
			_, err := collection.InsertOne(context.TODO(), auditLog)
			if err != nil {
				// Log the error but don't block the original request's success
				// You can also add more sophisticated error handling here if needed
				fmt.Println("Error saving audit log:", err)
			}
		}

		return err
	}
}