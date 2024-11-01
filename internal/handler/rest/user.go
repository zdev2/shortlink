package rest

import (
	"context"
	"fmt"
	"os"
	"shortlink/internal/database"
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
    collection := database.MongoClient.Database("shortlink").Collection("user")
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
        Email: registerReq.Email,
        Password: string(hash),
        IsActive: false,
        CreatedAt: time.Now(),
        UpdateAt: time.Now(),
        DeletedAt: nil,
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
    collection := database.MongoClient.Database("shortlink").Collection("user")
    var query bson.M
    if strings.Contains(logReq.Username, "@") {
        // Login by email
        query = bson.M{"email": logReq.Username}
    } else {
        // Login by username
        query = bson.M{"username": logReq.Username}
    }
    err := collection.FindOne(context.TODO(), query).Decode(&userAcc)
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

    // Return token in the JSON response
    return OK(c, fiber.Map{
        "message": "Login successful",
        "token":   tokenString,
        "user":    userAcc,
    })
}

func GetAllUsers(c *fiber.Ctx) error {
    // Define an empty slice to hold users
    var users []model.User

    // Connect to the user collection
    collection := database.MongoClient.Database("shortlink").Collection("user")

    // Query the collection for all users
    cursor, err := collection.Find(context.TODO(), bson.M{})
    if err != nil {
        return InternalServerError(c, "Failed to retrieve users from the database")
    }
    defer cursor.Close(context.TODO())

    // Iterate over the cursor to decode all users
    for cursor.Next(context.TODO()) {
        var user model.User
        if err := cursor.Decode(&user); err != nil {
            return InternalServerError(c, "Error decoding user")
        }
        users = append(users, user)
    }

    if err := cursor.Err(); err != nil {
        return InternalServerError(c, "Cursor error")
    }

    // Return the list of users as JSON
    return OK(c, fiber.Map{
        "users": users,
    })
}

func Logout(c *fiber.Ctx) error {
    c.ClearCookie("Authorization")
    return OK(c, fiber.Map{
        "message": "Logout successful",
    })
}

func GetUserByID(c *fiber.Ctx) error {
	userID := c.Params("id")
	collection := database.MongoClient.Database("shortlink").Collection("user")

	var user model.User
	err := collection.FindOne(context.TODO(), bson.M{"_id": userID}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return NotFound(c, "User not found")
		}
		return InternalServerError(c, "Error fetching user")
	}

	return OK(c, fiber.Map{
		"user": user,
	})
}

func UpdateUser(c *fiber.Ctx) error {
	userID := c.Params("id")
	var updateReq model.User // Assume model.User holds fields that can be updated

	if err := c.BodyParser(&updateReq); err != nil {
		return BadRequest(c, "Failed to read body request")
	}

	collection := database.MongoClient.Database("shortlink").Collection("user")
	update := bson.M{
		"$set": bson.M{
			"email":    updateReq.Email,
			"username": updateReq.Username,
			// Include more fields as necessary
			"update_at": time.Now(),
		},
	}

	_, err := collection.UpdateOne(context.TODO(), bson.M{"_id": userID}, update)
	if err != nil {
		return InternalServerError(c, "Error updating user")
	}

	return OK(c, fiber.Map{
		"message": "User updated successfully",
	})
}

func DeleteUser(c *fiber.Ctx) error {
	userID := c.Params("id")
	collection := database.MongoClient.Database("shortlink").Collection("user")

	// Soft delete the user (mark as deleted)
	_, err := collection.UpdateOne(context.TODO(), bson.M{"_id": userID}, bson.M{"$set": bson.M{"deleted_at": time.Now()}})
	if err != nil {
		return InternalServerError(c, "Error deleting user")
	}

	return OK(c, fiber.Map{
		"message": "User deleted successfully",
	})
}
