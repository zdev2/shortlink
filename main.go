package main

import (
	"shortlink/config"
	"shortlink/internal/database"
	"shortlink/internal/handler/rest"
	"shortlink/internal/routes"

	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
)

func main() {
	config.InitEnv()
	
	// Initialize MongoDB connection
	client, err := database.OpenDB()
	if err != nil {
		logrus.Fatalf("Failed to connect to MongoDB: %v", err)
	}

	database.CreateCollectionsAndIndexes(client)

	app := fiber.New(fiber.Config{
		EnableTrustedProxyCheck: true,
		TrustedProxies:           []string{"*"},
	})
	
	
	
	// initial route
	routes.RouteSetup(app)
	user := database.GetCollection("user")

	app.Get("/", func(c *fiber.Ctx) error {
		clientIP, _ := rest.GetPublicIP() 
		return c.JSON(fiber.Map{
			"message": "MongoDB client initialized successfully",
			"client": client,
			"user": user,
			"client_ip": clientIP,
		})
	})
	
	// open fiber on http://localhost:3000
	err = app.Listen(":3000")
	if err != nil {
		logrus.Fatalf("Error on running Fiber: %v", err)
	}
}
