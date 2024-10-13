package generator

import (
	"math/rand"
	"time"
)

// Define the characters to use in the short link
const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

// Initialize a seeded random number generator
var seededRand *rand.Rand = rand.New(
	rand.NewSource(time.Now().UnixNano()))

// generateShortLink creates a random short link with the specified length
func GenerateShortLink(length int) string {
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[seededRand.Intn(len(charset))]
	}
	return string(b)
}