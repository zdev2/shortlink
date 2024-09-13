package model

import (
	"time"
)

type QRImage struct {
    ID            string    `bson:"_id,omitempty" json:"id"` //
    UserID        string    `bson:"user_id" json:"userid"` //             
    URLID         string    `bson:"url_id" json:"urlid"` //              
    Base64Image   string    `bson:"base64_image" json:"base64image"` //        
    GeneratedAt   time.Time `bson:"generated_at" json:"generatedat"` //        
    ExpirationAt  *time.Time `bson:"expiration_at,omitempty" json:"expirationat"` // 
    Status        string    `bson:"status" json:"status"` //             
    Model
}