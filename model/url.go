package model

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Url struct {
	ID 				primitive.ObjectID 	`bson:"_id,omitempty" json:"id"` //
	UserID 			primitive.ObjectID 	`bson:"user_id" json:"userid"` //
	URL 			string 				`bson:"url" json:"url"` //
	ShortLink 		string 				`bson:"shortlink" json:"shortlink"` //
	ClickCount 		int 				`bson:"click_count" json:"clickcount"` //
	LastAccessedAt 	time.Time 			`bson:"last_accessed_at" json:"lastaccesedat"` //
	ExpDate 		time.Time 			`bson:"expiration_date" json:"expdate"`  //
	Status 			string 				`bson:"status" json:"status"`  //
	URLPassword 	string 				`bson:"url_password" json:"url_password"`  //
	Model
}
