package repoconfig

import (
	"context"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var client *mongo.Client // Global client

// OpenDB initializes and sets the MongoDB client globally
func OpenDB() (*mongo.Client, error) {
	clientOptions := options.Client().ApplyURI(os.Getenv("MONGODB_URI"))
	var err error
	client, err = mongo.Connect(context.TODO(), clientOptions) // Set global client
	if err != nil {
		return nil, err
	}

	// Check the connection
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	err = client.Ping(ctx, nil)
	if err != nil {
		return nil, err
	}

	log.Println("Connected to MongoDB!")
	return client, nil
}

// GetCollection returns a MongoDB collection
func GetCollection(collectionName string) *mongo.Collection {
	if client == nil { // If client is nil, fail early
		log.Fatal("MongoDB client is not initialized")
	}
	return client.Database("shortlink").Collection(collectionName)
}
