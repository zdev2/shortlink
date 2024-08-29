package model

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID 				primitive.ObjectID 	`bson:"_id,omitempty"`
	Username 		string 				`bson:"username"` //
	FullName 		string 				`bson:"fullname"`//
	Email 			string 				`bson:"email"`//
	Password 		string 				`bson:"password"`//
	IsActive 		bool 				`bson:"is_active"`//
	Role 			string 				`bson:"role"`//
	LastLogin 		time.Time 			`bson:"last_login"`//
	ProfilePicture 	string 				`bson:"profile_picture"`//
	Model
}