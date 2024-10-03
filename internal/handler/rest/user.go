package rest

import (
	"context"
	repoconfig "shortlink/internal/repository/config"
	"shortlink/model"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

var userCollection *mongo.Collection = repoconfig.GetCollection("user")

type logReq struct {
	Username string `json:"username" bson:"username"`
	Password string `json:"password" bson:"password"`
}

// LoginHandler handles user login
func LoginHandler(c *fiber.Ctx) error {
	var req logReq
	if err := c.BodyParser(&req); err != nil {
		return BadRequest(c, "LogReq")
	}

	// Get the collection after initialization
	var user model.User
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	err := userCollection.FindOne(ctx, bson.M{"username": req.Username}).Decode(&user)
	if err != nil {
		return BadRequest(c, "LogReq -> MongoDB")
	}

	return OK(c, nil)
}
