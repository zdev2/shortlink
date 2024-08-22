package model

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Url struct {
	ID primitive.ObjectID `json:"_id"`
	UserID primitive.ObjectID `json:"user_id"`
	URL string `json:"url"`
	ShortLink string `json:"shortlink"`
	ClickCount int `json:"click_count"`
	LastAccessedAt time.Time `json:"last_accessed_at"`
	ExpDate time.Time `json:"expiration_date"`
	Status string `json:"status"`
	Tags []string `json:"tags"`
	Model
}