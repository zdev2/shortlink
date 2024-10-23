package model

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID 				primitive.ObjectID 	`bson:"_id,omitempty" json:"id"` //
	Username 		string 				`bson:"username" json:"username"` //
	FullName 		string 				`bson:"fullname" json:"full_name"`// 
	Email 			string 				`bson:"email" json:"email"`//
	Password 		string 				`bson:"password" json:"-"`//
	IsActive 		bool 				`bson:"is_active" json:"is_active"`//
	LastLogin 		time.Time 			`bson:"last_login" json:"last_login"`//
	CreatedAt 		time.Time 		    `bson:"created_at" json:"createdat"` // 
	UpdateAt 		time.Time 			`bson:"updated_at" json:"updateat"` // 
	DeletedAt 		*time.Time 			`bson:"deleted_at,omitempty" json:"deletedat"` // 
}