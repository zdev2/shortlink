package utils

import (
	"time"

	"golang.org/x/exp/rand"
)

func GenerateShortURL() string {
	letters := []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")
	rand.Seed(uint64(time.Now().UnixNano()))
	shortURL := make([]rune, 10)
	for i := range shortURL {
		shortURL[i] = letters[rand.Intn(len(letters))]
	}
	return string(shortURL)
}

