package main

import (
	"context"
	"os"
	"os/signal"
	repoconfig "shortlink/internal/repository/config"
	"shortlink/internal/routes"
	"syscall"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/template/html/v2"
	"github.com/joho/godotenv"
	"github.com/sirupsen/logrus"
)

func main() {
	// Load the .env file
	if err := godotenv.Load(); err != nil {
		logrus.Fatalf("Error loading .env file")
	}

	// Open MongoDB connection
	if err := repoconfig.OpenDB(); err != nil {
		logrus.Fatalf("Failed to connect to MongoDB: %v", err)
	}

	// Create Fiber engine for templates
	engine := html.New("./template", ".html")
	app := fiber.New(fiber.Config{
		Views: engine,
	})

	// Serve static files
	app.Static("/", "./template/home")
	app.Static("/src", "./src")

	// Set up routes
	routes.RouteSetup(app)

	// Handle graceful shutdown
	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

		<-sigChan
		logrus.Info("Shutting down server...")

		// Close MongoDB connection
		if err := repoconfig.GetClient().Disconnect(context.Background()); err != nil {
			logrus.Errorf("Error closing MongoDB connection: %v", err)
		}

		if err := app.Shutdown(); err != nil {
			logrus.Errorf("Error shutting down Fiber app: %v", err)
		}
		logrus.Info("Server stopped gracefully.")
	}()

	// Start the Fiber app on http://localhost:3000
	if err := app.Listen(":3000"); err != nil {
		logrus.Fatal("Error starting Fiber server: ", err.Error())
	}
}
