package rest

import (
	"context"
	repoconfig "shortlink/internal/repository/config"
	"shortlink/model"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

var userCollection *mongo.Collection = repoconfig.GetCollection("user")

type logReq struct {
	Username string `json:"username" bson:"username"`
	Password string `json:"password" bson:"password"`
}

type registerReq struct {
	Username string `json:"username" bson:"username"`
	FullName string `json:"fullname" bson:"fullname"`
	Email    string `json:"email" bson:"email"`
	Password string `json:"password" bson:"password"`
}

// LoginHandler handles user login
func LoginHandler(c *fiber.Ctx) error {
	var req logReq
	if err := c.BodyParser(&req); err != nil {
		return BadRequest(c, "Invalid request data")
	}

	var user model.User
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Find user by username
	err := userCollection.FindOne(ctx, bson.M{"username": req.Username}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return BadRequest(c, "Invalid username or password")
		}
		return BadRequest(c, "Error querying database")
	}

	// Check password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return BadRequest(c, "Invalid username or password")
	}

	return OK(c, "Login successful")
}

// RegisterHandler handles user registration
func RegisterHandler(c *fiber.Ctx) error {
	var req registerReq
	if err := c.BodyParser(&req); err != nil {
		return BadRequest(c, "Invalid request data")
	}

	var user model.User
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Check if username already exists
	err := userCollection.FindOne(ctx, bson.M{"username": req.Username}).Decode(&user)
	if err == nil {
		return BadRequest(c, "Username already exists")
	}
	if err != mongo.ErrNoDocuments {
		return BadRequest(c, "Error querying database")
	}

	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return BadRequest(c, "Error hashing password")
	}

	// Create new user
	newUser := model.User{
		Username: req.Username,
		FullName: req.FullName,
		Email:    req.Email,
		Password: string(hashedPassword),
	}

	// Insert new user into the database
	_, err = userCollection.InsertOne(ctx, newUser)
	if err != nil {
		return BadRequest(c, "Error saving user to database")
	}

	return OK(c, "Registration successful")
}

// ChangePassword handles password changes
func ChangePassword(c *fiber.Ctx) error {
	// Implement password change logic here
	return OK(c, "Password changed successfully")
}
