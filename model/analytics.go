package model

import "go.mongodb.org/mongo-driver/bson/primitive"

type Analytics struct {
	ID     primitive.ObjectID `json:"_id"`
	UserID primitive.ObjectID `json:"user_id"`
	UserAgent string `json:"user_agent"`
	Referrer string `json:"referrer"`
	Location string `json:"location"`
	AccessedAt string `json:"accessed_at"`
}