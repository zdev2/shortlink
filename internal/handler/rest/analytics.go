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

func GetAnalytics(c *fiber.Ctx) error {
	user := c.Locals("user").(*jwt.Token)
	claims := user.Claims.(jwt.MapClaims)
	userID := claims["sub"].(string)

	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return BadRequest(c, "Invalid UserID format")
	}

	collection := database.MongoClient.Database("shortlink").Collection("analytics")
	filter := bson.M{"user_id": objectID}
	cursor, err := collection.Find(context.TODO(), filter)
	if err != nil {
		return InternalServerError(c, "Error fetching Analytics")
	}
	defer cursor.Close(context.TODO())

	var analytics []model.Analytics
	if err = cursor.All(context.TODO(), &analytics); err != nil {
		return InternalServerError(c, "Error decoding Analytics")
	}

	return OK(c, fiber.Map{
		"message": 		"Analytics fetched successfully",
		"analytics":  	analytics,
	})
}