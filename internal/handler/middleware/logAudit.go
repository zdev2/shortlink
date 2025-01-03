package middleware

import (
	"context"
	"fmt"
	"shortlink/internal/database"
	"shortlink/internal/handler/rest"
	"shortlink/logger"
	"shortlink/model"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func AuditMiddleware(action, entity string) fiber.Handler {
    return func(c *fiber.Ctx) error {
        log := logger.GetLogger()
        // Call the next handler (perform the main action like GET, POST, etc.)
        err := c.Next()

        if err == nil {
            // Retrieve user token from context
            userToken := c.Locals("user")
            if userToken == nil {
                log.Warning("", "No token found in context")
                return err
            }

            // Assert that userToken is of type *jwt.Token
            token, ok := userToken.(*jwt.Token)
            if !ok {
                log.Warning("", "Token is not of type *jwt.Token")
                return err
            }

            // Extract claims from token
            claims, ok := token.Claims.(jwt.MapClaims)
            if !ok || !token.Valid {
                log.Warning("", "Invalid token claims or token is not valid")
                fmt.Println("Invalid token claims or token is not valid")
                return err
            }
            
            // Retrieve user ID (subject) from claims
            userIDHex, _ := claims["sub"].(string)
            userID, _ := primitive.ObjectIDFromHex(userIDHex)
            publicIP, _ := rest.GetPublicIP()
            
            // Log audit action
            auditLog := model.AuditLog{
                ID:        primitive.NewObjectID(),
                UserID:    userID,
                Action:    action,
                Entity:    entity,
                EntityID:  c.Params("id", ""),
                Timestamp: time.Now(),
                IPAddress: publicIP,
            }
            
            collection := database.MongoClient.Database("shortlink").Collection("audit_log")
            _, err := collection.InsertOne(context.TODO(), auditLog)
            if err != nil {
                log.Warning("", "Error saving audit log")
                fmt.Println("Error saving audit log:", err)
            }
        }

        return err
    }
}
