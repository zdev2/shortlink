package model

import (
	"time"
)

type Model struct {
	CreatedAt 	time.Time 	`bson:"created_at" json:"createdat"` // 
	UpdateAt 	time.Time 	`bson:"updated_at" json:"updateat"` // 
	DeletedAt 	*time.Time 	`bson:"deleted_at,omitempty" json:"deletedat"` // 
}