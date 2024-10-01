package repoconfig

import (
	"context"
	"errors"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var client *mongo.Client // Global client variable

// OpenDB initializes the MongoDB client connection
func OpenDB() error {
	mongoURI := os.Getenv("MONGODB_URI")
	if mongoURI == "" {
		return errors.New("MONGODB_URI environment variable not set")
	}

	clientOptions := options.Client().ApplyURI(mongoURI)
	var err error
	client, err = mongo.Connect(context.TODO(), clientOptions)
	if err != nil {
		return err
	}

	// Check the connection
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	err = client.Ping(ctx, nil)
	if err != nil {
		return err
	}

	log.Println("Connected to MongoDB!")
	return nil
}

// GetCollection returns a MongoDB collection by name
func GetCollection(collectionName string) *mongo.Collection {
	if client == nil {
		log.Fatal("MongoDB client is not initialized") // This will terminate the program
	}
	return client.Database("shortlink").Collection(collectionName)
}

// GetClient returns the MongoDB client instance
func GetClient() *mongo.Client {
	return client
}

