package rest

import (
	"context"
	"fmt"
	"os"
	repoconfig "shortlink/internal/repository/config"
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
    FullName string `json:"fullname" bson:"fullname"`
    Email    string `json:"email" bson:"email"`
    Password string `json:"password" bson:"password"`
}

func Register(c *fiber.Ctx) error {
    if err := c.BodyParser(&registerReq); err != nil {
        return BadRequest(c, "Failed to read body request")
    }
    if registerReq.Username == "" {
        return BadRequest(c, "Username cannot be empty")
    }
    if registerReq.Password == "" {
        return BadRequest(c, "Password cannot be empty")
    }
    registerReq.Username = strings.TrimSpace(registerReq.Username)
	registerReq.Password = strings.TrimSpace(registerReq.Password)
    hash, err := bcrypt.GenerateFromPassword([]byte(registerReq.Password), bcrypt.DefaultCost)
	if err != nil {
		return BadRequest(c, "Failed to hashed password")
	}
    collection := repoconfig.MongoClient.Database("shortlink").Collection("user")
    var existUser model.User
    filter := bson.M{"username": registerReq.Username}
    err = collection.FindOne(context.TODO(), filter).Decode(&existUser)
	if err == nil {
		return Conflict(c, "Admin name already exists")
	} else if err != mongo.ErrNoDocuments {
		return InternalServerError(c, "Error checking for existing admin name")
    }
	user := model.User{
		ID:            primitive.NewObjectID(),
		Username: registerReq.Username,
        FullName: registerReq.FullName,
        Email: registerReq.Email,
        Password: string(hash),
        IsActive: false,
        Model: model.Model{
            CreatedAt: time.Now(),
            UpdateAt: time.Now(),
            DeletedAt: nil,
        },
	}
	_, err = collection.InsertOne(context.TODO(), user)
	if err != nil {
		return InternalServerError(c, "Failed to create admin account")
	}
	return OK(c, fiber.Map{
        "text": "user account created successfully", 
        "user_acc": user,
    })
}

func Login(c *fiber.Ctx) error {
    if err := c.BodyParser(&logReq); err != nil {
        return BadRequest(c, "Failed to read body request")
    }
    logReq.Username = strings.TrimSpace(logReq.Username)
    logReq.Password = strings.TrimSpace(logReq.Password)
    var userAcc model.User
    collection := repoconfig.MongoClient.Database("shortlink").Collection("user")
    err := collection.FindOne(context.TODO(), bson.M{"username": logReq.Username}).Decode(&userAcc)
    if err != nil {
        if err == mongo.ErrNoDocuments {
            return Unauthorized(c, "Invalid username")
        }
        return InternalServerError(c, "Database error")
    }
    if userAcc.DeletedAt != nil && !userAcc.DeletedAt.IsZero() {
        return Gone(c, fmt.Sprintf("This account has already been deleted, %s", userAcc.DeletedAt))
    }
    err = bcrypt.CompareHashAndPassword([]byte(userAcc.Password), []byte(logReq.Password))
    if err != nil {
        return Unauthorized(c, "Invalid password")
    }
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
        "sub": userAcc.ID.Hex(),
        "exp": time.Now().Add(time.Hour * 24 * 30).Unix(),
    })
    secret := os.Getenv("SUPERDUPERMEGABIGTOPSECRETINTHISPROJECTWHYIUSETHISNAMEFORMYCODEBRUHLOL")
    if secret == "" {
        return InternalServerError(c, "Secret key not set")
    }
    tokenString, err := token.SignedString([]byte(secret))
    if err != nil {
        return BadRequest(c, "Failed to create token")
    }
    c.Cookie(&fiber.Cookie{
        Name:     "Authorization",
        Value:    tokenString,
        Expires:  time.Now().Add(24 * time.Hour * 30),
        HTTPOnly: true,
    })
    return OK(c, fiber.Map{
        "message": "Login successful",
        "user":    userAcc,
    })
}