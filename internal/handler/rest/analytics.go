package rest

import (
	"context"
	"shortlink/internal/database"
	"shortlink/model"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func GetGlobalAnalytics(c *fiber.Ctx) error {
	// Retrieve the logged-in user from the token claims
	user := c.Locals("user").(*jwt.Token)
	claims := user.Claims.(jwt.MapClaims)
	userID := claims["sub"].(string)

	// Convert the userID string to an ObjectID
	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return BadRequest(c, "Invalid UserID format")
	}

	// Access the analytics collection
	collection := database.MongoClient.Database("shortlink").Collection("analytics")

	// Find all analytics where the user_id matches the logged-in user
	filter := bson.M{"user_id": objectID}
	cursor, err := collection.Find(context.TODO(), filter)
	if err != nil {
		return InternalServerError(c, "Error fetching analytics")
	}
	defer cursor.Close(context.TODO())

	// Store analytics records in a slice
	var analytics []model.Analytics
	if err := cursor.All(context.TODO(), &analytics); err != nil {
		return InternalServerError(c, "Error decoding analytics")
	}

	// Return all analytics related to the user as JSON
	return OK(c, fiber.Map{
		"message":   "User's global analytics fetched successfully",
		"analytics": analytics,
	})
}


func GetAnalyticsByURL(c *fiber.Ctx) error {
	// Get the URL ID from the request params
	urlID := c.Params("urlID")
	
	// Convert the urlID string to ObjectID
	objectID, err := primitive.ObjectIDFromHex(urlID)
	if err != nil {
		return BadRequest(c, "Invalid URL ID format")
	}

	// Access the analytics collection
	collection := database.MongoClient.Database("shortlink").Collection("analytics")

	// Query for analytics records related to the specific URL ID
	filter := bson.M{"url_id": objectID}
	cursor, err := collection.Find(context.TODO(), filter)
	if err != nil {
		return InternalServerError(c, "Error fetching analytics by URL")
	}
	defer cursor.Close(context.TODO())

	// Store the results in a slice
	var analytics []model.Analytics
	if err := cursor.All(context.TODO(), &analytics); err != nil {
		return InternalServerError(c, "Error decoding analytics for the URL")
	}

	// Return analytics related to the specific URL as JSON
	return OK(c, fiber.Map{
		"message":   "Analytics for the specific URL fetched successfully",
		"analytics": analytics,
	})
}
