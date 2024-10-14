package model

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type AuditLog struct {
	ID 			primitive.ObjectID 	`bson:"_id,omitempty" json:"id"` //
	UserID 		primitive.ObjectID 	`bson:"user_id" json:"userid"` //
	Action 		string 				`bson:"action" json:"action"` //
	Entity 		string 				`bson:"entity" json:"entity"` //
	EntityID 	string 				`bson:"entity_id" json:"entityid"` //
	Timestamp	time.Time 			`bson:"timestamp" json:"timestamp"` //
	IPAddress 	string 				`bson:"ip_adress" json:"ipaddress"` //
}