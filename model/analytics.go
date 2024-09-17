package model

import "go.mongodb.org/mongo-driver/bson/primitive"

type Analytics struct {
	ID         primitive.ObjectID `bson:"_id,omitempty" json:"id"`       //
	UserID     primitive.ObjectID `bson:"user_id" json:"userid"`         //
	UserAgent  string             `bson:"user_agent" json:"useragent"`   //
	Referrer   string             `bson:"referrer" json:"referrer"`      //
	Location   string             `bson:"location" json:"location"`      //
	AccessedAt string             `bson:"accessed_at" json:"accessedat"` //
}
