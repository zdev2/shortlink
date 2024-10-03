package main

import (
	"log"
	"shortlink/config"
	repoconfig "shortlink/internal/repository/config"
	"shortlink/internal/routes"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/template/html/v2"
)

func main() {
	// Initialize environment variables
	config.InitEnv()

	// Open the MongoDB connection
	_, err := repoconfig.OpenDB() // Initialize the client
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}

	// Initialize Fiber with the HTML template engine
	engine := html.New("./template", ".html")
	app := fiber.New(fiber.Config{
		Views: engine,
	})
	app.Static("/", "./template/home")
	app.Static("/src", "./src")

	// Setup routes
	routes.RouteSetup(app)

	// Start the server
	err = app.Listen(":3000")
	if err != nil {
		log.Fatalf("Error starting server: %v", err)
	}
}
