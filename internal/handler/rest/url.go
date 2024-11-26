package rest

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"shortlink/internal/database"
	"shortlink/internal/generator"
	"shortlink/internal/utils"
	"shortlink/logger"
	"shortlink/model"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/net/html"
)

// GenerateURL handles the generation of a short URL
func GenerateURL(c *fiber.Ctx) error {
	log := logger.GetLogger()
	var urlReq struct {
		URL         string `json:"url"`
		URLPassword string `json:"url_password"`
		Title       string `json:"url_title"`
		ShortLink   string `json:"shortlink"`
		ExpDate     string `json:"expdate"` // Use string to capture empty value
	}

	// Parse the request body
	if err := c.BodyParser(&urlReq); err != nil {
		log.Error("BAD_REQUEST", "Invalid request body")
		return utils.BadRequest(c, "Invalid request body")
	}

	// Validate URL format
	if _, err := url.ParseRequestURI(urlReq.URL); err != nil {
		log.Error("BAD_REQUEST", "Invalid URL format")
		return utils.BadRequest(c, "Invalid URL format")
	}

	// Retrieve the user ID from the claims stored in context
	claims := c.Locals("user").(jwt.MapClaims)
	userID, ok := claims["sub"].(string)
	if !ok {
		log.Error("BAD_REQUEST", "Invalid UserID in token")
		return utils.BadRequest(c, "Invalid UserID in token")
	}

	// Convert userID to MongoDB ObjectID
	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		log.Error("BAD_REQUEST", "Invalid UserID format")
		return utils.BadRequest(c, "Invalid UserID format")
	}

	collection := database.MongoClient.Database("shortlink").Collection("urls")

	// Check if the provided short link is unique
	if urlReq.ShortLink != "" {
		var existingUrl model.Url
		err := collection.FindOne(context.TODO(), bson.M{"shortlink": urlReq.ShortLink}).Decode(&existingUrl)
		if err == nil {
			log.Warning("BAD_REQUEST", "Short link already exists")
			return utils.BadRequest(c, "Short link already exists")
		}
	}

	// Get the next URL ID
	urlID, err := generator.GetNextIncrementalID(collection, "url_id")
	if err != nil {
		log.Error("INTERNAL_SERVER_ERROR", "Failed to create URL ID")
		return utils.Conflict(c, "Failed to create URL ID for short URL")
	}

	// Handle short link creation
	shortLink := urlReq.ShortLink
	if shortLink == "" {
		shortLink = generator.GenerateShortLink(6)
	}

	urlTitle := urlReq.Title
	if urlTitle == "" {
		urlTitle, _ = getUrlTitle(urlReq.URL)
	}

	// Handle expiration date
	var expDate *time.Time
	if urlReq.ExpDate != "" {
		parsedDate, err := time.Parse(time.RFC3339, urlReq.ExpDate)
		if err != nil {
			log.Error("BAD_REQUEST", "Invalid expiration date format")
			return utils.BadRequest(c, "Invalid expiration date format")
		}
		expDate = &parsedDate
	}

	link := os.Getenv("BASEURL")

	// Get the current time for timestamps
	currentTime := time.Now()
	qrcode, _ := GenerateQRCode(fmt.Sprintf("%s/%s", link, shortLink))

	// Generate the short link and create a new URL document
	url := model.Url{
		ID:             primitive.NewObjectID(),
		URLID:          urlID,
		UserID:         objectID,
		URL:            urlReq.URL,
		Title:          urlTitle,
		ShortLink:      shortLink,
		ClickCount:     0,
		LastAccessedAt: currentTime,
		ExpDate:        expDate,
		Status:         "active",
		URLPassword:    urlReq.URLPassword,
		CreatedAt:      currentTime,
		UpdateAt:       currentTime,
		DeletedAt:      nil,
		QRCode:         qrcode,
	}

	// Insert the new URL document into the MongoDB collection
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	_, err = collection.InsertOne(ctx, url)
	if err != nil {
		log.Error("INTERNAL_SERVER_ERROR", "Failed to create short URL")
		return utils.Conflict(c, "Failed to create short URL")
	}

	log.Success("SUCCESS", "Short URL created successfully")

	// Return the success response
	return utils.OK(c, fiber.Map{
		"message":     "Short URL created successfully",
		"shortlink":   url.ShortLink,
		"url_details": url,
	})
}

func EditShortLink(c *fiber.Ctx) error {
	log := logger.GetLogger()
	var editReq struct {
		ShortLink string `json:"shortlink"`
	}

	// Parse request body to get the new shortlink
	if err := c.BodyParser(&editReq); err != nil {
		log.Error("BAD_REQUEST", "Invalid request body")
		return utils.BadRequest(c, "Invalid request body")
	}

	// Validate that shortlink is not empty
	if editReq.ShortLink == "" {
		log.Warning("BAD_REQUEST", "ShortLink cannot be empty")
		return utils.BadRequest(c, "ShortLink cannot be empty")
	}

	// Get the URL ID from the URL params and convert to int64
	urlID, err := primitive.ObjectIDFromHex(c.Params("id"))
	if err != nil {
		log.Error("BAD_REQUEST", "Invalid URL ID format")
		return utils.BadRequest(c, "Invalid URL ID format")
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
		log.Error("INTERNAL_SERVER_ERROR", "Failed to update shortlink")
		return utils.Conflict(c, "Failed to update shortlink")
	}

	log.Success("SUCCESS", "ShortLink updated successfully")

	// Return success response
	return utils.OK(c, fiber.Map{"message": "ShortLink updated successfully"})
}

func RedirectURL(c *fiber.Ctx) error {
	log := logger.GetLogger()
	shortLink := c.Params("shortlink")

	// Fetch URL details from the "urls" collection, excluding soft-deleted ones
	collection := database.MongoClient.Database("shortlink").Collection("urls")
	var url model.Url
	err := collection.FindOne(context.TODO(), bson.M{
		"shortlink": shortLink,
		"$or": []bson.M{
			{"deleted_at": bson.M{"$exists": false}}, // DeletedAt field does not exist
			{"deleted_at": bson.M{"$eq": nil}},       // DeletedAt field is nil
		},
	}).Decode(&url)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			log.Warning("NOT_FOUND", "Short URL not found")
			return utils.NotFound(c, "Short URL not found")
		}
		log.Error("INTERNAL_SERVER_ERROR", "Error fetching URL")
		return utils.Conflict(c, "Error fetching URL")
	}

	// Update last accessed and click count
	_, err = collection.UpdateOne(context.TODO(), bson.M{"_id": url.ID}, bson.M{
		"$set": bson.M{"last_accessed_at": time.Now()},
		"$inc": bson.M{"click_count": 1},
	})
	if err != nil {
		log.Error("INTERNAL_SERVER_ERROR", "Error updating URL")
		return utils.Conflict(c, "Error updating URL")
	}

	// Capture IP address and log analytics
	ip, _ := GetPublicIP()
	userAgent := c.Get("User-Agent")
	referrer := c.Get("Referer")

	// Get location from IP using ipinfo or similar service
	location := GetLocationFromIP(ip)

	// Prepare analytics data
	analytics := model.Analytics{
		ID:         primitive.NewObjectID(),
		UserID:     url.UserID,
		URLID:      url.ID,
		UserAgent:  userAgent,
		Referrer:   referrer,
		Location:   location,
		AccessedAt: time.Now(),
	}

	// Insert analytics into a separate MongoDB collection
	analyticsCollection := database.MongoClient.Database("shortlink").Collection("analytics")
	_, err = analyticsCollection.InsertOne(context.TODO(), analytics)
	if err != nil {
		log.Error("INTERNAL_SERVER_ERROR", "Error logging analytics")
		return utils.Conflict(c, "Error logging analytics")
	}

	// Redirect the user to the original URL
	return c.Redirect(url.URL, 301)
}

func DeleteURL(c *fiber.Ctx) error {
	log := logger.GetLogger()

	// Get the URL ID from the URL params and convert to int64
	urlID, err := primitive.ObjectIDFromHex(c.Params("id"))
	if err != nil {
		log.Warning("BAD_REQUEST", "Invalid URL ID format")
		return utils.BadRequest(c, "Invalid URL ID format")
	}

	// Perform the delete operation by marking as deleted (soft delete)
	collection := database.MongoClient.Database("shortlink").Collection("urls")
	filter := bson.M{"url_id": urlID}
	update := bson.M{"$set": bson.M{
		"deleted_at": time.Now(),
	}}

	// Execute the update
	_, err = collection.UpdateOne(context.TODO(), filter, update)
	if err != nil {
		log.Error("INTERNAL_SERVER_ERROR", "Error deleting URL")
		return utils.Conflict(c, "Error deleting URL")
	}

	log.Success("SUCCESS", "URL deleted successfully")

	// Return success response
	return utils.OK(c, fiber.Map{"message": "URL deleted successfully"})
}

// GetURLs retrieves all URLs for the logged-in user
func GetURLs(c *fiber.Ctx) error {
	log := logger.GetLogger()
	// Retrieve claims from context, asserting as jwt.MapClaims
	claims := c.Locals("user").(jwt.MapClaims)
	userID := claims["sub"].(string) // Get the user ID from claims

	// Convert the userID to ObjectID
	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		log.Warning("BAD_REQUEST", "Invalid UserID format")
		return utils.BadRequest(c, "Invalid UserID format")
	}

	// Define the filter for the MongoDB query
	collection := database.MongoClient.Database("shortlink").Collection("urls")
	filter := bson.M{
		"user_id": objectID,
		"$or": []bson.M{
			{"deleted_at": bson.M{"$exists": false}}, // DeletedAt field does not exist
			{"deleted_at": bson.M{"$eq": nil}},       // DeletedAt field is nil
		},
	}

	// Execute the MongoDB query
	cursor, err := collection.Find(context.TODO(), filter)
	if err != nil {
		log.Error("INTERNAL_SERVER_ERROR", "Error fetching URLs")
		return utils.Conflict(c, "Error fetching URLs")
	}
	defer cursor.Close(context.TODO())

	// Decode the results into a slice of Url models
	var urls []model.Url
	if err = cursor.All(context.TODO(), &urls); err != nil {
		log.Error("INTERNAL_SERVER_ERROR", "Error decoding URLs")
		return utils.Conflict(c, "Error decoding URLs")
	}

	// Return the URLs in the response
	log.Info("SUCCESS", "URLs fetched successfully")
	return utils.OK(c, fiber.Map{
		"message": "URLs fetched successfully",
		"urls":    urls,
	})
}

// GetURLbyID retrieves a specific URL by its ID
func GetURLbyID(c *fiber.Ctx) error {
	log := logger.GetLogger()
	urlID, err := primitive.ObjectIDFromHex(c.Params("id"))
	if err != nil {
		log.Warning("BAD_REQUEST", "Invalid URL ID format")
		return utils.BadRequest(c, "Invalid URL ID format")
	}

	collection := database.MongoClient.Database("shortlink").Collection("urls")
	var url model.Url
	err = collection.FindOne(context.TODO(), bson.M{
		"url_id": urlID,
		"$or": []bson.M{
			{"deleted_at": bson.M{"$exists": false}}, // DeletedAt field does not exist
			{"deleted_at": bson.M{"$eq": nil}},       // DeletedAt field is nil
		},
	}).Decode(&url)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			log.Warning("NOT_FOUND", "URL not found")
			return utils.NotFound(c, "URL not found")
		}
		log.Error("INTERNAL_SERVER_ERROR", "Error fetching URL")
		return utils.Conflict(c, "Error fetching URL")
	}

	log.Info("SUCCESS", "URL fetched successfully")
	return utils.OK(c, fiber.Map{"url": url})
}



// GetUserUrlLogs retrieves logs (URLs) for the logged-in user
func GetUserUrlLogs(c *fiber.Ctx) error {
	log := logger.GetLogger()
	claims := c.Locals("user").(jwt.MapClaims)
	userID, ok := claims["sub"].(string)
	if !ok {
		log.Warning("BAD_REQUEST", "User ID not found in token claims")
		return utils.BadRequest(c, "User ID not found in token claims")
	}
	
	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return utils.BadRequest(c, "Invalid UserID format")
	}
	
	collection := database.MongoClient.Database("shortlink").Collection("urls")
	filter := bson.M{"user_id": objectID}
	cursor, err := collection.Find(context.TODO(), filter)
	if err != nil {
		log.Error("INTERNAL_SERVER_ERROR", "Error fetching URLs")
		return utils.Conflict(c, "Error fetching URLs")
	}
	defer cursor.Close(context.TODO())
	
	var urls []model.Url
	if err = cursor.All(context.TODO(), &urls); err != nil {
		log.Error("INTERNAL_SERVER_ERROR", "Error decoding URLs")
		return utils.Conflict(c, "Error decoding URLs")
	}

	log.Info("SUCCESS", "User URL Logs fetched successfully")
	return utils.OK(c, fiber.Map{
		"message": "User URL logs fetched successfully",
		"urls":    urls,
	})
}


func getUrlTitle(url string)(string, error){
	if !strings.HasPrefix(url, "http://") && !strings.HasPrefix(url, "https://") {
		url = "http://" + url
	}

	resp, err := http.Get(url)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	z := html.NewTokenizer(resp.Body)

	for {
		tt := z.Next()
		switch tt {
		case html.ErrorToken:
			return "", fmt.Errorf("title not found")
		case html.StartTagToken:
			t := z.Token()

			// Check if the token is a <title> tag
			if t.Data == "title" {
				z.Next() // Move to the text inside the <title> tag
				title := z.Token().Data
				return strings.TrimSpace(title), nil
			}
		}
	}
}
