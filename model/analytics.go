package model

import "go.mongodb.org/mongo-driver/bson/primitive"

type Analytics struct {
	ID     		primitive.ObjectID 	`bson:"_id,omitempty"`
	UserID 		primitive.ObjectID 	`bson:"user_id"`
	UserAgent 	string				`bson:"user_agent"`
	Referrer 	string 				`bson:"referrer"`
	Location 	string 				`bson:"location"`
	AccessedAt 	string 				`bson:"accessed_at"`
}