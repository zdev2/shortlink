package routes

import (
	"shortlink/internal/handler/rest"

	"github.com/gofiber/fiber/v2"
)

func RouteSetup(app *fiber.App) {

	api := app.Group("/api/v1")

	// API endpoints (return JSON)
	api.Get("/users", nil)                      // Fetch all users
	api.Get("/users/:id", nil)                  // Fetch a specific user by ID
	api.Post("/users/login", rest.Login)        // Login user
	api.Post("/users/register", rest.Register)  // Register a new user
	api.Put("/users/:id", nil)                  // Update user info
	api.Delete("/users/:id", nil)               // Delete a user

	// URL routes
	api.Get("/urls", rest.GetURLs)              // Fetch all URLs for the logged-in user
	api.Get("/urls/:id", rest.GetURLbyID)       // Fetch short URL by ID
	api.Post("/urls", rest.GenerateURL)         // Generate a new short URL
	api.Put("/urls/:id", rest.EditURL)          // Update an existing short URL
	api.Delete("/urls/:id", rest.DeleteURL)     // Delete a short URL

	// Analytics routes
	api.Get("/analytics", nil)                  // Fetch global analytics
	api.Get("/analytics/:urlID", nil)           // Fetch analytics for a specific URL
}
