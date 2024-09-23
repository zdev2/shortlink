package rest

import (
	"context"
	"shortlink/internal/repository/config"
	"shortlink/model"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

var userCollection *mongo.Collection = config.GetCollection("users")

type logReq struct {
		Username string `json:"username" bson:"username"`
		Password string `json:"password" bson:"password"`
}

type registerReq struct {
    Username       string `json:"username" bson:"username"`
    FullName       string `json:"fullname" bson:"fullname"`
    Email          string `json:"email" bson:"email"`
    Password       string `json:"password" bson:"password"`
}


func LoginHandler(c *fiber.Ctx) error {
	var req logReq
	if err := c.BodyParser(req); err != nil {
		return BadRequest(c, "LogReq")
	}

	var user model.User
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	err := userCollection.FindOne(ctx, bson.M{"username": req.Username}).Decode(&user)
	if err != nil {
		return BadRequest(c, "LogReq -> MongoDB")
	}

	return OK(c, nil)
}

func RegisterHandler(c *fiber.Ctx) error {
	var req registerReq
	if err := c.BodyParser(req); err != nil {
		return BadRequest(c, "Register	Req")
	}

	var user model.User
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	err := userCollection.FindOne(ctx, bson.M{"username": req.Username}).Decode(&user)
	if err != nil {
		return BadRequest(c, "RegisterReq -> MongoDB")
	}

	return OK(c, nil)
}

func ChangePassword(c *fiber.Ctx) error {
	return OK(c, nil)
}

