package config

import (
	"context"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type MongoDB struct {
	Client mongo.Client
}

var client *mongo.Client

func OpenDB() (*mongo.Client, error){
	// MongoDB
	clientOptions := options.Client().ApplyURI(os.Getenv("MONGODB_URI"))
	client, err := mongo.Connect(context.TODO(), clientOptions)
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

func CreateCollectionsAndIndexes(client *mongo.Client) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	db := client.Database("shortlink")

	// Creating collections (if they don't exist)
	collections := []string{"user", "url", "audit_log", "analytics"}
	for _, collection := range collections {
		if err := db.CreateCollection(ctx, collection); err != nil {
			log.Printf("Collection %s already exists or an error occurred: %v", collection, err)
		}
	}

	// Creating indexes
	userCollection := db.Collection("user")
	urlCollection := db.Collection("url")
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

func GetCollection(collectionName string) *mongo.Collection {
    return client.Database("shortlink").Collection(collectionName)
}