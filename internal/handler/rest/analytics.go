package rest

import (
	"context"
	"shortlink/internal/database"
	"shortlink/internal/utils"
	"shortlink/logger"
	"shortlink/model"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func GetGlobalAnalytics(c *fiber.Ctx) error {
	// Retrieve the logged-in user from the token claims
	log := logger.GetLogger()
	claims := c.Locals("user").(jwt.MapClaims)
	userID, ok := claims["sub"].(string)

	if !ok {
		if !ok {
			log.Warning("BAD_REQUEST", "User ID not found in token claims")
			return utils.BadRequest(c, "User ID not found in token claims")
		}
	}

	// Convert the userID string to an ObjectID
	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		log.Warning("BAD_REQUEST", "Invalid UserID format")
		return utils.BadRequest(c, "Invalid UserID format")
	}

	// Access the analytics collection
	collection := database.MongoClient.Database("shortlink").Collection("analytics")

	// Find all analytics where the user_id matches the logged-in user
	filter := bson.M{"user_id": objectID}
	cursor, err := collection.Find(context.TODO(), filter)
	if err != nil {
		log.Warning("CONFLICT", "Error fetching analytics")
		return utils.Conflict(c, "Error fetching analytics")
	}
	defer cursor.Close(context.TODO())
	
	// Store analytics records in a slice
	var analytics []model.Analytics
	if err := cursor.All(context.TODO(), &analytics); err != nil {
		log.Warning("CONFLICT", "Error decoding analytics")
		return utils.Conflict(c, "Error decoding analytics")
	}

	// Return all analytics related to the user as JSON
	log.Success("SUCCESS", "User's global analytics fetched successfully")
	return utils.OK(c, fiber.Map{
		"message":   "User's global analytics fetched successfully",
		"analytics": analytics,
	})
}


func GetAnalyticsByURL(c *fiber.Ctx) error {
	log := logger.GetLogger()
	// Get the URL ID from the request params
	urlID := c.Params("id")
	
	// Convert the urlID string to ObjectID
	objectID, err := primitive.ObjectIDFromHex(urlID)
	if err != nil {
		log.Warning("BAD_REQUEST", "Invalid URL ID format")
		return utils.BadRequest(c, "Invalid URL ID format")
	}

	// Access the analytics collection
	collection := database.MongoClient.Database("shortlink").Collection("analytics")

	// Query for analytics records related to the specific URL ID
	filter := bson.M{"url_id": objectID}
	cursor, err := collection.Find(context.TODO(), filter)
	if err != nil {
		log.Error("INTERNAL_SERVER_ERROR", "Error fetching analytics by URL")
		return utils.Conflict(c, "Error fetching analytics by URL")
	}
	defer cursor.Close(context.TODO())
	
	if !cursor.Next(context.TODO()) {
		log.Warning("NOT_FOUND", "No analytics found for the specified URL")
		return utils.NotFound(c, "No analytics found for the specified URL")
	}
	
	// Store the results in a slice
	var analytics []model.Analytics
	if err := cursor.All(context.TODO(), &analytics); err != nil {
		log.Error("INTERNAL_SERVER_ERROR", "Error decoding analytics by URL")
		return utils.Conflict(c, "Error decoding analytics for the URL")
	}

	// Return analytics related to the specific URL as JSON
	log.Success("SUCCESS", "Analytics for the specific URL fetched successfully")
	return utils.OK(c, fiber.Map{
		"message":   "Analytics for the specific URL fetched successfully",
		"analytics": analytics,
	})
}
