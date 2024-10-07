package routes

import (
	"shortlink/internal/handler/rest"

	"github.com/gofiber/fiber/v2"
)

func RouteSetup(app *fiber.App) {
	

	api := app.Group("/api/v1")

	// API endpoints (return JSON)
	api.Get("/users", nil)                 // Fetch all users
	api.Get("/users/:id", nil)          // Fetch a specific user by ID
	api.Post("/users/login", rest.Login) // Login user
	api.Post("/users/register", rest.Register)   // Register a new user
	api.Put("/users/:id", nil)           // Update user info
	api.Delete("/users/:id", nil)        // Delete a user

	api.Get("/urls", nil)                   // Fetch all URLs
	api.Get("/urls/:id", nil)            // Fetch short URL by ID
	api.Post("/urls", nil)         // Generate a new short URL
	api.Put("/urls/:id", nil)             // Update an existing short URL
	api.Delete("/urls/:id", nil)          // Delete a short URL

	api.Get("/analytics", nil)         // Fetch global analytics
	api.Get("/analytics/:urlID", nil) // Fetch analytics for a specific URL

	api.Post("/urls/:id/qrcode", nil) // Generate a QR code for a specific short URL
}
/*
// Get: User, URL, URL/:id, Analytics
// Post: UserLogin, URL, QRCode
// Put: URL
// Delete: URL
*/