package model

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID primitive.ObjectID `json:"_id"`
	Username string `json:"username"`
	FullName string `json:"fullname"`
	Email string `json:"email"`
	Password string `json:"password"`
	IsActive bool `json:"is_active"`
	Role string `json:"role"`
	LastLogin time.Time `json:"last_login"`
	ProfilePicture string `json:"profile_picture"`
	Model
}