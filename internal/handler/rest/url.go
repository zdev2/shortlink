package rest

import (
	"context"
	"math/rand"
	"shortlink/internal/database"
	"shortlink/internal/generator"
	"shortlink/model"
	"strconv"
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
		URL         string `json:"url"`
		URLPassword string `json:"url_password"`
	}

	// Parse the request body
	if err := c.BodyParser(&urlReq); err != nil {
		return BadRequest(c, "Invalid request body")
	}

	// Retrieve the user ID from the context (stored by ValidateCookie middleware)
	userID, ok := c.Locals("user").(string)
	if !ok || userID == "" {
		return Unauthorized(c, "Unauthorized: Missing or invalid token")
	}

	// Convert userID (which is a string) to MongoDB ObjectID
	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return BadRequest(c, "Invalid UserID format")
	}
	collection := database.MongoClient.Database("shortlink").Collection("urls")
	
	urlID, err := generator.GetNextIncrementalID(collection, "url_id")
	if err != nil {
		return InternalServerError(c, "Failed to create URL ID for short URL")
	}

	// Generate the short link and create a new URL document
	url := model.Url{
		ID:             primitive.NewObjectID(),
		URLID: urlID,
		UserID:         objectID,
		URL:            urlReq.URL,
		ShortLink:      generateShortLink(6), // Assume this function generates the short link
		ClickCount:     0,
		LastAccessedAt: time.Now(),
		ExpDate:        time.Now().Add(30 * 24 * time.Hour), // 30-day expiration by default
		Status:         "active",
		URLPassword:    urlReq.URLPassword,
	}

	// Insert the new URL document into the MongoDB collection
	_, err = collection.InsertOne(context.TODO(), url)
	if err != nil {
		return InternalServerError(c, "Failed to create short URL")
	}

	// Return the success response
	return OK(c, fiber.Map{
		"message":   "Short URL created successfully",
		"shortlink": url.ShortLink,
		"url_details": url,
	})
}


// EditURL handles updating the URL or its details
func EditShortLink(c *fiber.Ctx) error {
	var editReq struct {
		ShortLink string `json:"shortlink"`
	}

	// Parse request body to get the new shortlink
	if err := c.BodyParser(&editReq); err != nil {
		return BadRequest(c, "Invalid request body")
	}

	// Validate that shortlink is not empty
	if editReq.ShortLink == "" {
		return BadRequest(c, "ShortLink cannot be empty")
	}

	// Get the URL ID from the URL params and convert to int64
	urlID, err := strconv.ParseInt(c.Params("url_id"), 10, 64)
	if err != nil {
		return BadRequest(c, "Invalid URL ID format")
	}

	// Create MongoDB filter and update using url_id as int64
	collection := database.MongoClient.Database("shortlink").Collection("urls")
	filter := bson.M{"url_id": urlID}
	update := bson.M{"$set": bson.M{
		"shortlink": editReq.ShortLink,
	}}

	// Perform the update in the database
	_, err = collection.UpdateOne(context.TODO(), filter, update)
	if err != nil {
		return InternalServerError(c, "Failed to update shortlink")
	}

	// Return success response
	return OK(c, fiber.Map{"message": "ShortLink updated successfully"})
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

	collection := database.MongoClient.Database("shortlink").Collection("urls")
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

	collection := database.MongoClient.Database("shortlink").Collection("urls")
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

	collection := database.MongoClient.Database("shortlink").Collection("urls")
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
    // Parse the url_id parameter as int64
    urlID, err := strconv.ParseInt(c.Params("url_id"), 10, 64)
    if err != nil {
        return BadRequest(c, "Invalid URL ID format")
    }

    // Connect to the MongoDB collection
    collection := database.MongoClient.Database("shortlink").Collection("urls")

    // Attempt to delete the document with the given int64 ID
    result, err := collection.DeleteOne(context.TODO(), bson.M{"_id": urlID})
    if err != nil {
        return InternalServerError(c, "Failed to delete URL")
    }

    // Check if a document was actually deleted
    if result.DeletedCount == 0 {
        return NotFound(c, "URL not found")
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

	collection := database.MongoClient.Database("shortlink").Collection("urls")
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


//