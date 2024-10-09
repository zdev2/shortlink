package routes

import (
	"shortlink/internal/handler/middleware"
	"shortlink/internal/handler/rest"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func RouteSetup(app *fiber.App) {

	app.Use(cors.New(cors.Config{
		AllowCredentials: true, // Required to send cookies with CORS
		AllowOrigins:     "http://127.0.0.1:3000", // Adjust to match your frontend
	}))

	app.Get("/:shortlink", rest.RedirectURL)

	api := app.Group("/api/v1")

	// API endpoints (return JSON)
	api.Get("/users", rest.GetAllUsers)                      // Fetch all users
	api.Get("/users/:id", nil)                  // Fetch a specific user by ID
	api.Post("/users/login", rest.Login)        // Login user
	api.Post("/users/register", rest.Register)  // Register a new user
	api.Put("/users/:id", nil)                  // Update user info
	api.Delete("/users/:id", nil)               // Delete a user

	// URL routes
	api.Get("/urls", middleware.ValidateCookie, rest.GetURLs)              // Fetch all URLs for the logged-in user
	api.Get("/urls/:url_id", middleware.ValidateCookie, rest.GetURLbyID)       // Fetch short URL by ID
	api.Post("/urls", middleware.ValidateCookie, rest.GenerateURL)         // Generate a new short URL
	api.Put("/urls/:url_id", middleware.ValidateCookie, rest.EditShortLink)          // Update an existing short URL
	api.Delete("/urls/:url_id", middleware.ValidateCookie, rest.DeleteURL)     // Delete a short URL

	// Analytics routes
	api.Get("/analytics", nil)                  // Fetch global analytics
	api.Get("/analytics/:urlID", nil)           // Fetch analytics for a specific URL
}
