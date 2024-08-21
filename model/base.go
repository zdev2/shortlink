package model

import (
	"time"

	"gorm.io/gorm"
)

type Model struct {
	CreatedAt time.Time `json:"created_at"` 
	UpdateAt time.Time `json:"updated_at"` 
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at"` 
}