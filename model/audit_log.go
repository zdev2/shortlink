package model

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type AuditLog struct {
	ID 			primitive.ObjectID 	`bson:"_id,omitempty"`
	UserID 		primitive.ObjectID 	`bson:"user_id"`
	Action 		string 				`bson:"action"`
	Entity 		string 				`bson:"entity"`
	EntityID 	string 				`bson:"entity_id"`
	Timestamp	time.Time 			`bson:"timestamp"`
	IPAddress 	string 				`bson:"ip_adress"`
}