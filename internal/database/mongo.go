package database

import (
	"context"
	"fmt"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var MongoClient *mongo.Client

// OpenDB initializes the MongoDB client and stores it in the global `client` variable.
func OpenDB() (*mongo.Client, error) {
	clientOptions := options.Client().ApplyURI("mongodb+srv://bagus:urlshortener@superskibidisigma.d27tu.mongodb.net/")
	var err error
	MongoClient, err = mongo.Connect(context.TODO(), clientOptions)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to MongoDB: %w", err)
	}

	// Check the connection with a ping
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	err = MongoClient.Ping(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to ping MongoDB: %w", err)
	}

	log.Println("Connected to MongoDB!")
	return MongoClient, nil
}

// CreateCollectionsAndIndexes creates collections and indexes in MongoDB
func CreateCollectionsAndIndexes(client *mongo.Client) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	db := client.Database("shortlink")

	// Creating collections (if they don't exist)
	collections := []string{"user", "urls", "audit_log", "analytics"}
	for _, collection := range collections {
		if err := db.CreateCollection(ctx, collection); err != nil {
			log.Printf("Collection %s already exists or an error occurred: %v", collection, err)
		}
	}

	// Creating indexes
	userCollection := db.Collection("user")
	urlCollection := db.Collection("urls")
	// Add more as needed

	// Example: Creating an index on the `username` field in the `user` collection
	indexModel := mongo.IndexModel{
		Keys:    bson.D{{Key: "username", Value: 1}}, // 1 for ascending order
		Options: options.Index().SetUnique(true),      // Ensuring the index is unique
	}
	_, err := userCollection.Indexes().CreateOne(ctx, indexModel)
	if err != nil {
		return err
	}

	// Example: Creating an index on the `shortlink` field in the `url` collection
	indexModel = mongo.IndexModel{
		Keys:    bson.D{{Key: "shortlink", Value: 1}},
		Options: options.Index().SetUnique(true),
	}
	_, err = urlCollection.Indexes().CreateOne(ctx, indexModel)
	if err != nil {
		return err
	}

	// Add more indexes as needed
	log.Println("Collections and indexes created successfully!")
	return nil
}

// GetCollection retrieves a collection from the MongoDB database.
func GetCollection(collectionName string) *mongo.Collection {
    if MongoClient == nil {
        log.Fatal("MongoClient is not initialized, call OpenDB() first")
    }
    return MongoClient.Database("shortlink").Collection(collectionName)
}
