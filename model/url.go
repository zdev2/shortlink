package model

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Url struct {
	ID              primitive.ObjectID `bson:"_id,omitempty" json:"id"`         //
	UserID          primitive.ObjectID `bson:"user_id" json:"userid"`          //
	URLID           int64              `bson:"url_id" json:"url_id"`
	URL             string             `bson:"url" json:"url"`                 //
	Title			string 			   `bson:"url_title" json:"url_title"`
	ShortLink       string             `bson:"shortlink" json:"shortlink"`     //
	ClickCount      int                `bson:"click_count" json:"clickcount"`  //
	LastAccessedAt  time.Time          `bson:"last_accessed_at" json:"lastaccesedat"` //
	ExpDate         *time.Time         `bson:"expiration_date" json:"expdate"` //
	Status          string             `bson:"status" json:"status"`           //
	URLPassword     string             `bson:"url_password" json:"url_password"` //
	QRCode          string             `bson:"qr_code" json:"qr_code"`         // Changed base64 to string
	CreatedAt 		time.Time 		   `bson:"created_at" json:"createdat"` // 
	UpdateAt 		time.Time 	       `bson:"updated_at" json:"updateat"` // 
	DeletedAt 		*time.Time 	       `bson:"deleted_at,omitempty" json:"deletedat"` // 
}
