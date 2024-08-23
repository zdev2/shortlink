package model

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Url struct {
	ID 				primitive.ObjectID 	`bson:"_id,omitempty"`
	UserID 			primitive.ObjectID 	`bson:"user_id"`
	URL 			string 				`bson:"url"`
	ShortLink 		string 				`bson:"shortlink"`
	ClickCount 		int 				`bson:"click_count"`
	LastAccessedAt 	time.Time 			`bson:"last_accessed_at"`
	ExpDate 		time.Time 			`bson:"expiration_date"`
	Status 			string 				`bson:"status"`
	Tags 			[]string 			`bson:"tags"`
	Model
}
