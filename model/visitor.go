package model

import "go.mongodb.org/mongo-driver/bson/primitive"

type Visitor struct {
	ID primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	IPAdress string `bson:"ip_address" json:"ipadress"`
	UserAgent string `bson:"user_agent" json:"useragent"`
}