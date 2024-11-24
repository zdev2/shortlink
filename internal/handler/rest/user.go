package rest

import (
	"context"
	"fmt"
	"os"
	"shortlink/internal/database"
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
	"golang.org/x/crypto/bcrypt"
)


var logReq struct {
	Username string `json:"username" bson:"username"`
	Password string `json:"password" bson:"password"`
}

var registerReq struct {
	Username string `json:"username" bson:"username"`
	Email    string `json:"email" bson:"email"`
	Password string `json:"password" bson:"password"`
}

func Register(c *fiber.Ctx) error {
	log := logger.GetLogger()
	if err := c.BodyParser(&registerReq); err != nil {
		log.Warning("BAD_REQUEST", "Failed to parse body in register request")
		return utils.BadRequest(c, "Invalid request body")
	}
	if registerReq.Username == "" {
		log.Warning("BAD_REQUEST", "Username field is empty")
		return utils.BadRequest(c, "Username is required")
	}
	if registerReq.Password == "" {
		log.Warning("BAD_REQUEST", "Password field is empty")
		return utils.BadRequest(c, "Password is required")
	}
	
	registerReq.Username = strings.TrimSpace(registerReq.Username)
	registerReq.Password = strings.TrimSpace(registerReq.Password)
	hash, err := bcrypt.GenerateFromPassword([]byte(registerReq.Password), bcrypt.DefaultCost)
	if err != nil {
		log.Error("INTERNAL_SERVER_ERROR", "Failed to hash password")
		return utils.InternalServerError(c, "Error generating password hash")
	}

	collection := database.MongoClient.Database("shortlink").Collection("user")
	var existUser model.User
	filter := bson.M{"username": registerReq.Username}
	err = collection.FindOne(context.TODO(), filter).Decode(&existUser)
	if err == nil {
		log.Warning("CONFLICT", "Username already exists")
		return utils.Conflict(c, "Username already exists")
	} else if err != mongo.ErrNoDocuments {
		log.Error("INTERNAL_SERVER_ERROR", "Database error during user check")
		return utils.InternalServerError(c, "Database error")
	}

	user := model.User{
		ID:        primitive.NewObjectID(),
		Username:  registerReq.Username,
		Email:     registerReq.Email,
		Password:  string(hash),
		IsActive:  false,
		CreatedAt: time.Now(),
		UpdateAt:  time.Now(),
		DeletedAt: nil,
	}
	_, err = collection.InsertOne(context.TODO(), user)
	if err != nil {
		log.Error("INTERNAL_SERVER_ERROR", "Failed to insert user in database")
		return utils.InternalServerError(c, "Failed to create user")
	}

	log.Info("INFO", "User registered successfully")
	return utils.OK(c, fiber.Map{
		"text":      "User account created successfully",
		"user_acc": user,
	})
}

func Login(c *fiber.Ctx) error {
	log := logger.GetLogger()
	if err := c.BodyParser(&logReq); err != nil {
		log.Warning("BAD_REQUEST", "Failed to parse body in login request")
		return utils.BadRequest(c, "Invalid request body")
	}

	logReq.Username = strings.TrimSpace(logReq.Username)
	logReq.Password = strings.TrimSpace(logReq.Password)
	var userAcc model.User
	collection := database.MongoClient.Database("shortlink").Collection("user")
	var query bson.M
	if strings.Contains(logReq.Username, "@") {
		query = bson.M{"email": logReq.Username}
	} else {
		query = bson.M{"username": logReq.Username}
	}

	err := collection.FindOne(context.TODO(), query).Decode(&userAcc)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			log.Warning("UNAUTHORIZED", "Invalid username or email")
			return utils.Unauthorized(c, "Invalid username or email")
		}
		log.Error("INTERNAL_SERVER_ERROR", "Database error during login")
		return utils.InternalServerError(c, "Database error")
	}

	if userAcc.DeletedAt != nil && !userAcc.DeletedAt.IsZero() {
		log.Warning("GONE", "Attempt to access a deleted account")
		return utils.Gone(c, fmt.Sprintf("This account was deleted on %s", userAcc.DeletedAt))
	}

	err = bcrypt.CompareHashAndPassword([]byte(userAcc.Password), []byte(logReq.Password))
	if err != nil {
		log.Warning("UNAUTHORIZED", "Invalid password")
		return utils.Unauthorized(c, "Invalid password")
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": userAcc.ID.Hex(),
		"exp": time.Now().Add(time.Hour * 24 * 30).Unix(),
	})
	secret := os.Getenv("JWT_TOKEN")
	if secret == "" {
		log.Error("INTERNAL_SERVER_ERROR", "JWT secret key is not set")
		return utils.InternalServerError(c, "Internal server error")
	}

	tokenString, err := token.SignedString([]byte(secret))
	if err != nil {
		log.Error("INTERNAL_SERVER_ERROR", "Failed to sign JWT token")
		return utils.InternalServerError(c, "Failed to generate token")
	}

	c.Cookie(&fiber.Cookie{
		Name:     "authToken",
		Value:    tokenString,
		Expires:  time.Now().Add(time.Hour * 24 * 30),
		HTTPOnly: true,
		Secure:   false,
		Path:     "/",
	})

	lastLogin := bson.M{
		"$set": bson.M{
			"last_login": time.Now(),
		},
	}

	_, err = collection.UpdateOne(context.TODO(), bson.M{"username": logReq.Username}, lastLogin)
	if err != nil {
		log.Error("INTERNAL_SERVER_ERROR", "Error updating user")
		return utils.InternalServerError(c, "Error updating user")
	}

	log.Success("SUCCESS", "User logged in successfully")
	return utils.OK(c, fiber.Map{
		"token":   tokenString,
		"message": "Login successful",
		"user":    userAcc,
	})
}

func GetAllUsers(c *fiber.Ctx) error {
	log := logger.GetLogger()
	var users []model.User

	collection := database.MongoClient.Database("shortlink").Collection("user")
	cursor, err := collection.Find(context.TODO(), bson.M{})
	if err != nil {
		log.Error("INTERNAL_SERVER_ERROR", "Failed to retrieve users from the database")
		return utils.InternalServerError(c, "Failed to retrieve users")
	}
	defer cursor.Close(context.TODO())

	for cursor.Next(context.TODO()) {
		var user model.User
		if err := cursor.Decode(&user); err != nil {
			log.Error("INTERNAL_SERVER_ERROR", "Error decoding user")
			return utils.InternalServerError(c, "Error decoding user")
		}
		users = append(users, user)
	}

	if err := cursor.Err(); err != nil {
		log.Error("INTERNAL_SERVER_ERROR", "Cursor error")
		return utils.InternalServerError(c, "Cursor error")
	}

	log.Info("INFO", "Users retrieved successfully")
	return utils.OK(c, fiber.Map{
		"users": users,
	})
}

func Logout(c *fiber.Ctx) error {
	log := logger.GetLogger()
	c.ClearCookie("Authorization")
	log.Info("INFO", "User logged out successfully")
	return utils.OK(c, fiber.Map{
		"message": "Logout successful",
	})
}

func GetUserByID(c *fiber.Ctx) error {
	log := logger.GetLogger()
	userID := c.Params("id")
	collection := database.MongoClient.Database("shortlink").Collection("user")

	var user model.User
	err := collection.FindOne(context.TODO(), bson.M{"_id": userID}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			log.Warning("NOT_FOUND", "User not found")
			return utils.NotFound(c, "User not found")
		}
		log.Error("INTERNAL_SERVER_ERROR", "Error fetching user")
		return utils.InternalServerError(c, "Error fetching user")
	}

	log.Info("INFO", "User retrieved successfully")
	return utils.OK(c, fiber.Map{
		"user": user,
	})
}

func UpdateUser(c *fiber.Ctx) error {
	log := logger.GetLogger()
	userID := c.Params("id")
	var updateReq model.User

	if err := c.BodyParser(&updateReq); err != nil {
		log.Warning("BAD_REQUEST", "Failed to parse update request")
		return utils.BadRequest(c, "Failed to read body request")
	}

	collection := database.MongoClient.Database("shortlink").Collection("user")
	update := bson.M{
		"$set": bson.M{
			"email":     updateReq.Email,
			"username":  updateReq.Username,
			"update_at": time.Now(),
		},
	}

	_, err := collection.UpdateOne(context.TODO(), bson.M{"_id": userID}, update)
	if err != nil {
		log.Error("INTERNAL_SERVER_ERROR", "Error updating user")
		return utils.InternalServerError(c, "Error updating user")
	}

	log.Info("INFO", "User updated successfully")
	return utils.OK(c, fiber.Map{
		"message": "User updated successfully",
	})
}

func DeleteUser(c *fiber.Ctx) error {
	log := logger.GetLogger()
	userID := c.Params("id")
	collection := database.MongoClient.Database("shortlink").Collection("user")

	_, err := collection.UpdateOne(context.TODO(), bson.M{"_id": userID}, bson.M{"$set": bson.M{"deleted_at": time.Now()}})
	if err != nil {
		log.Error("INTERNAL_SERVER_ERROR", "Error deleting user")
		return utils.InternalServerError(c, "Error deleting user")
	}

	log.Info("INFO", "User deleted successfully")
	return utils.OK(c, fiber.Map{
		"message": "User deleted successfully",
	})
}
