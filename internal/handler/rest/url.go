package rest

import (
	"context"
	"net/url"
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

// GenerateURL handles the generation of a short URL
func GenerateURL(c *fiber.Ctx) error {
	var urlReq struct {
		URL         string `json:"url"`
		URLPassword string `json:"url_password"`
		ShortLink   string `json:"shortlink"`
		ExpDate     string `json:"expdate"` // Use string to capture empty value
	}

	// Parse the request body
	if err := c.BodyParser(&urlReq); err != nil {
		return BadRequest(c, "Invalid request body")
	}

	// Validate URL format
	if _, err := url.ParseRequestURI(urlReq.URL); err != nil {
		return BadRequest(c, "Invalid URL format")
	}

	// Retrieve the user from the JWT token stored in context
	user := c.Locals("user").(*jwt.Token)
	claims := user.Claims.(jwt.MapClaims)
	userID := claims["sub"].(string)

	// Convert userID (which is a string) to MongoDB ObjectID
	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return BadRequest(c, "Invalid UserID format")
	}

	collection := database.MongoClient.Database("shortlink").Collection("urls")

	// Check if the provided short link is unique
	if urlReq.ShortLink != "" {
		var existingUrl model.Url
		err := collection.FindOne(context.TODO(), bson.M{"shortlink": urlReq.ShortLink}).Decode(&existingUrl)
		if err == nil {
			return BadRequest(c, "Short link already exists")
		}
	}

	// Get the next URL ID
	urlID, err := generator.GetNextIncrementalID(collection, "url_id")
	if err != nil {
		return InternalServerError(c, "Failed to create URL ID for short URL")
	}

	// Handle short link creation
	shortLink := urlReq.ShortLink
	if shortLink == "" {
		shortLink = generator.GenerateShortLink(6)
	}

	// Handle expiration date
	var expDate *time.Time
	if urlReq.ExpDate != "" {
		parsedDate, err := time.Parse(time.RFC3339, urlReq.ExpDate)
		if err != nil {
			return BadRequest(c, "Invalid expiration date format")
		}
		expDate = &parsedDate
	}

	// Get the current time for timestamps
	currentTime := time.Now()

	// Generate the short link and create a new URL document
	url := model.Url{
		ID:             primitive.NewObjectID(),
		URLID:          urlID,
		UserID:         objectID,
		URL:            urlReq.URL,
		ShortLink:      shortLink,
		ClickCount:     0,
		LastAccessedAt: currentTime,
		ExpDate:        expDate, // This can be nil
		Status:         "active",
		URLPassword:    urlReq.URLPassword,
		Model: model.Model{
			CreatedAt: currentTime,
			UpdateAt:  currentTime,
			DeletedAt: nil, // Not deleted initially
		},
	}

	// Insert the new URL document into the MongoDB collection
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	_, err = collection.InsertOne(ctx, url)
	if err != nil {
		return InternalServerError(c, "Failed to create short URL")
	}

	// Return the success response
	return OK(c, fiber.Map{
		"message":    "Short URL created successfully",
		"shortlink":  url.ShortLink,
		"url_details": url,
	})
}


// EditShortLink handles updating the URL or its details
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
	urlID, err := strconv.ParseInt(c.Params("id"), 10, 64)
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
	filter := bson.M{ 
		"user_id": objectID,
		"$or": []bson.M{
			{"deleted_at": bson.M{"$exists": false}}, // DeletedAt field does not exist
			{"deleted_at": bson.M{"$eq": nil}},      // DeletedAt field is nil
		},
	}
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
	urlID, err := strconv.ParseInt(c.Params("id"), 10, 64)
    if err != nil {
        return BadRequest(c, "Invalid URL ID format")
    }

	collection := database.MongoClient.Database("shortlink").Collection("urls")
	var url model.Url
	err = collection.FindOne(context.TODO(), bson.M{
		"url_id": urlID,
		"$or": []bson.M{
			{"deleted_at": bson.M{"$exists": false}}, // DeletedAt field does not exist
			{"deleted_at": bson.M{"$eq": nil}},      // DeletedAt field is nil
		},
		}).Decode(&url)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return NotFound(c, "URL not found")
		}
		return InternalServerError(c, "Error fetching URL")
	}

	return OK(c, fiber.Map{"url": url})
}

func RedirectURL(c *fiber.Ctx) error {
    shortLink := c.Params("shortlink")

    // Fetch URL details from the "urls" collection, excluding soft-deleted ones
    collection := database.MongoClient.Database("shortlink").Collection("urls")
    var url model.Url
    err := collection.FindOne(context.TODO(), bson.M{
        "shortlink":  shortLink,
        "$or": []bson.M{
            {"deleted_at": bson.M{"$exists": false}}, // DeletedAt field does not exist
            {"deleted_at": bson.M{"$eq": nil}},      // DeletedAt field is nil
        },
    }).Decode(&url)
    if err != nil {
        if err == mongo.ErrNoDocuments {
            return NotFound(c, "Short URL not found")
        }
        return InternalServerError(c, "Error fetching URL")
    }

    // Update last accessed and click count
    _, err = collection.UpdateOne(context.TODO(), bson.M{"_id": url.ID}, bson.M{
        "$set": bson.M{"last_accessed_at": time.Now()},
        "$inc": bson.M{"click_count": 1},
    })
    if err != nil {
        return InternalServerError(c, "Error updating URL")
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
        UserID:     url.UserID,  // Assuming `url` has a UserID field
        URLID:      url.ID,      // Associate with URL ID
        UserAgent:  userAgent,
        Referrer:   referrer,
        Location:   location,
        AccessedAt: time.Now(),
    }

    // Insert analytics into a separate collection
    analyticsCollection := database.MongoClient.Database("shortlink").Collection("analytics")
    _, err = analyticsCollection.InsertOne(context.TODO(), analytics)
    if err != nil {
        return InternalServerError(c, "Error saving analytics")
    }

    // Redirect to the long URL
    return c.Redirect(url.URL)
}


// DeleteURL handles the deletion of a short URL
func DeleteURL(c *fiber.Ctx) error {
    // Parse the url_id parameter as int64
    urlID, err := strconv.ParseInt(c.Params("id"), 10, 64)
    if err != nil {
        return BadRequest(c, "Invalid URL ID format")
    }

    // Connect to the MongoDB collection
    collection := database.MongoClient.Database("shortlink").Collection("urls")

    // Check if the URL exists and is not already deleted
    var url model.Url
    err = collection.FindOne(context.TODO(), bson.M{"url_id": urlID}).Decode(&url)
    if err != nil {
        if err == mongo.ErrNoDocuments {
            return NotFound(c, "URL not found")
        }
        return InternalServerError(c, "Error fetching URL")
    }

    // If the URL is already marked as deleted, return an error
    if url.Status == "deleted" {
        return BadRequest(c, "URL already deleted")
    }

    // Set the current timestamp for the DeletedAt field
    currentTime := time.Now()

    // Update the status field to mark the URL as deleted and set the DeletedAt timestamp
    update := bson.M{
        "$set": bson.M{
            "status":     "deleted",
            "deleted_at": currentTime,
        },
    }

    _, err = collection.UpdateOne(context.TODO(), bson.M{"url_id": urlID}, update)
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
		"message": "User URL logs fetched successfully",
		"urls":    urls,
	})
}
