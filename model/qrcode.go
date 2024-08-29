package model

import (
	"time"
)

type QRImage struct {
    ID            string    `bson:"_id,omitempty"`       
    UserID        string    `bson:"user_id"`             
    URLID         string    `bson:"url_id"`              
    Base64Image   string    `bson:"base64_image"`        
    GeneratedAt   time.Time `bson:"generated_at"`        
    ExpirationAt  *time.Time `bson:"expiration_at,omitempty"` 
    Status        string    `bson:"status"`             
    CreatedAt     time.Time `bson:"created_at"`          
    UpdatedAt     time.Time `bson:"updated_at"`          
    DeletedAt     *time.Time `bson:"deleted_at,omitempty"` 
}