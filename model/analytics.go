package model

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Analytics struct {
	ID         primitive.ObjectID `bson:"_id,omitempty" json:"id"`       //
	UserID     primitive.ObjectID `bson:"user_id" json:"userid"`         //
	URLID 	   primitive.ObjectID `bson:"url_id" json:"url_id"`          //
	VisitorID  primitive.ObjectID `bson:"visitor_id" json:"visitorid"`
	UserAgent  string             `bson:"user_agent" json:"useragent"`   //
	Referrer   string             `bson:"referrer" json:"referrer"`      //
	IPAdress   string			  `bson:"ip_adress" json:"ipadress"`
	Location   string             `bson:"location" json:"location"`      //
	AccessedAt time.Time          `bson:"accessed_at" json:"accessedat"` //
}
