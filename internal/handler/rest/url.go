package rest

import (
	"context"
	"math/rand"
	repoconfig "shortlink/internal/repository"
	"shortlink/model"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

// Define the characters to use in the short link
const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

// Initialize a seeded random number generator
var seededRand *rand.Rand = rand.New(
	rand.NewSource(time.Now().UnixNano()))

// generateShortLink creates a random short link with the specified length
func generateShortLink(length int) string {
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[seededRand.Intn(len(charset))]
	}
	return string(b)
}

// GenerateURL handles the generation of a short URL
func GenerateURL(c *fiber.Ctx) error {
	var urlReq struct {
		URL        string `json:"url"`
		URLPassword string `json:"url_password"`
	}

	if err := c.BodyParser(&urlReq); err != nil {
		return BadRequest(c, "Invalid request body")
	}

	// Check for JWT token in context
	userToken := c.Locals("user")
	if userToken == nil {
		return Unauthorized(c, "Unauthorized: Missing or invalid token")
	}

	user := userToken.(*jwt.Token)
	claims := user.Claims.(jwt.MapClaims)
	userID := claims["sub"].(string)

	// Convert userID to ObjectID
	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return BadRequest(c, "Invalid UserID format")
	}

	// Generate short link and create new URL document
	url := model.Url{
		ID:             primitive.NewObjectID(),
		UserID:         objectID,
		URL:            urlReq.URL,
		ShortLink:      generateShortLink(6), // Assume this generates the short link
		ClickCount:     0,
		LastAccessedAt: time.Now(),
		ExpDate:        time.Now().Add(30 * 24 * time.Hour), // 30 days expiration by default
		Status:         "active",
		URLPassword:    urlReq.URLPassword,
	}

	collection := repoconfig.MongoClient.Database("shortlink").Collection("urls")
	_, err = collection.InsertOne(context.TODO(), url)
	if err != nil {
		return InternalServerError(c, "Failed to create short URL")
	}

	return OK(c, fiber.Map{
		"message":    "Short URL created successfully",
		"shortlink":  url.ShortLink,
		"url_details": url,
	})
}

// EditURL handles updating the URL or its details
func EditURL(c *fiber.Ctx) error {
	var editReq struct {
		URL         string `json:"url"`
		URLPassword string `json:"url_password"`
		Status      string `json:"status"`
	}

	if err := c.BodyParser(&editReq); err != nil {
		return BadRequest(c, "Invalid request body")
	}

	urlID := c.Params("url_id")
	objectID, err := primitive.ObjectIDFromHex(urlID)
	if err != nil {
		return BadRequest(c, "Invalid URL ID format")
	}

	collection := repoconfig.MongoClient.Database("shortlink").Collection("urls")
	filter := bson.M{"_id": objectID}
	update := bson.M{"$set": bson.M{
		"url":          editReq.URL,
		"url_password": editReq.URLPassword,
		"status":       editReq.Status,
	}}

	_, err = collection.UpdateOne(context.TODO(), filter, update)
	if err != nil {
		return InternalServerError(c, "Failed to update URL")
	}

	return OK(c, fiber.Map{"message": "URL updated successfully"})
}

// GetURLs retrieves all URLs for the logged-in user
func GetURLs(c *fiber.Ctx) error {
	user := c.Locals("user").(*jwt.Token)
	claims := user.Claims.(jwt.MapClaims)
	userID := claims["sub"].(string)

	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return BadRequest(c, "Invalid UserID format")
	}

	collection := repoconfig.MongoClient.Database("shortlink").Collection("urls")
	filter := bson.M{"user_id": objectID}
	cursor, err := collection.Find(context.TODO(), filter)
	if err != nil {
		return InternalServerError(c, "Error fetching URLs")
	}
	defer cursor.Close(context.TODO())

	var urls []model.Url
	if err = cursor.All(context.TODO(), &urls); err != nil {
		return InternalServerError(c, "Error decoding URLs")
	}

	return OK(c, fiber.Map{
		"message": "URLs fetched successfully",
		"urls":    urls,
	})
}

// GetURLbyID retrieves a specific URL by its ID
func GetURLbyID(c *fiber.Ctx) error {
	urlID := c.Params("url_id")
	objectID, err := primitive.ObjectIDFromHex(urlID)
	if err != nil {
		return BadRequest(c, "Invalid URL ID format")
	}

	collection := repoconfig.MongoClient.Database("shortlink").Collection("urls")
	var url model.Url
	err = collection.FindOne(context.TODO(), bson.M{"_id": objectID}).Decode(&url)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return NotFound(c, "URL not found")
		}
		return InternalServerError(c, "Error fetching URL")
	}

	return OK(c, fiber.Map{"url": url})
}

// RedirectURL handles redirection from a short URL to the long URL
func RedirectURL(c *fiber.Ctx) error {
	shortLink := c.Params("shortlink")

	collection := repoconfig.MongoClient.Database("shortlink").Collection("urls")
	var url model.Url
	err := collection.FindOne(context.TODO(), bson.M{"shortlink": shortLink}).Decode(&url)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return NotFound(c, "Short URL not found")
		}
		return InternalServerError(c, "Error fetching URL")
	}

	// Update last accessed and click count
	_, err = collection.UpdateOne(context.TODO(), bson.M{"_id": url.ID}, bson.M{
		"$set":  bson.M{"last_accessed_at": time.Now()},
		"$inc":  bson.M{"click_count": 1},
	})
	if err != nil {
		return InternalServerError(c, "Error updating URL")
	}

	// Redirect to the long URL
	return c.Redirect(url.URL)
}

// DeleteURL handles the deletion of a short URL
func DeleteURL(c *fiber.Ctx) error {
	urlID := c.Params("url_id")
	objectID, err := primitive.ObjectIDFromHex(urlID)
	if err != nil {
		return BadRequest(c, "Invalid URL ID format")
	}

	collection := repoconfig.MongoClient.Database("shortlink").Collection("urls")
	_, err = collection.DeleteOne(context.TODO(), bson.M{"_id": objectID})
	if err != nil {
		return InternalServerError(c, "Failed to delete URL")
	}

	return OK(c, fiber.Map{"message": "URL deleted successfully"})
}

// GetUserUrlLogs retrieves logs (URLs) for the logged-in user
func GetUserUrlLogs(c *fiber.Ctx) error {
	user := c.Locals("user").(*jwt.Token)
	claims := user.Claims.(jwt.MapClaims)
	userID := claims["sub"].(string)

	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return BadRequest(c, "Invalid UserID format")
	}

	collection := repoconfig.MongoClient.Database("shortlink").Collection("urls")
	filter := bson.M{"user_id": objectID}
	cursor, err := collection.Find(context.TODO(), filter)
	if err != nil {
		return InternalServerError(c, "Error fetching URLs")
	}
	defer cursor.Close(context.TODO())

	var urls []model.Url
	if err = cursor.All(context.TODO(), &urls); err != nil {
		return InternalServerError(c, "Error decoding URLs")
	}

	return OK(c, fiber.Map{
		"message": "URLs fetched successfully",
		"urls":    urls,
	})
}
