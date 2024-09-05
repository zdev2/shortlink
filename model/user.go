package model

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID 				primitive.ObjectID 	`bson:"_id,omitempty"`
	Username 		string 				`bson:"username" json:"username"` //
	FullName 		string 				`bson:"fullname" json:"full_name"`//
	Email 			string 				`bson:"email" json:"email"`//
	Password 		string 				`bson:"password" json:"-"`//
	IsActive 		bool 				`bson:"is_active" json:"is_active"`//
	Role 			string 				`bson:"role" json:"role"`//
	LastLogin 		time.Time 			`bson:"last_login" json:"last_login"`//
	ProfilePicture 	string 				`bson:"profile_picture" json:"profile_picture"`//
	Model
}