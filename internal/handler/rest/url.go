package rest

import (
	"context"
	"shortlink/config"
	"shortlink/internal/handler/rest"
	"shortlink/model"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func GenerateURL(c *fiber.Ctx) error {
	var url model.Url
	if err := c.BodyParser(&url); err != nil {
		return rest.BadRequest(c, "Body Parsing Error")

	}

	//Generate short link (for simplicity, using the primitive objectID)
	url.ID = primitive.NewObjectID()
	url.ShortLink = url.ID.Hex()[:6]
	url.ClickCount = 0
	url.LastAccessedAt = time.Now()
	url.Status = "active"

	collection := mongo.Client.DB.collection("urls")
	_, err := collection.InsertOne(context.Background(), url)
	if err != nil {
		return rest.InternalServerError(c, "Database Insert Error")
	}
	return rest.Created(c, url, "")
}
//redirect to full url and increment click count
func RedirectToFullURL(c *fiber.Ctx) error {
	shortlink := c.Params("shortlink")
	var url model.Url

	collection := Database.DB.Collection("urls")
	err := collection.findOne(context.Background(), bson.M{"shortlink": shortlink}).Decode(&url)
	if err == Mongo.ErrNoDocuments {
		return rest.NotFound(c, "Short Link Not Found")
	} else if err != nil {
		return rest.InternalServerError(c, "Database Error")
	}
	// Update click count and last accesed time
	url.ClickCount++
	url.LastAccessedAt = time.Now()
	_, err = collection.UpdateOne(context.Background(), bson.M{"shortlink": shortlink}, bson.M{
		"$set": bson.M{"click_count": url.ClickCount, "last_accessed_at": url.LastAccessedAt},
	})
	if err != nil {
		return rest.InternalServerError(c, "Database Update Error")
	}

	return OK(c, fiber.Map{
		"message": "yes",
	})
	return c.Redirect(url.URL)
}

