package model

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type AuditLog struct {
	ID primitive.ObjectID `json:"_id"`
	UserID primitive.ObjectID `json:"user_id"`
	Action string `json:"action"`
	Entity string `json:"entity"`
	EntityID string `json:"entity_id"`
	Timestamp time.Time `json:"timestamp"`
	IPAddress string `json:"ip_adress"`
}