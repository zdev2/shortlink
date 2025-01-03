package routes

import (
	"shortlink/internal/handler/middleware"
	"shortlink/internal/handler/rest"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func RouteSetup(app *fiber.App) {

	// CORS Middleware setup
	app.Use(cors.New(cors.Config{
		AllowOrigins: "https://shortlink-production-dnds.up.railway.app, http://localhost:5173", // Replace with your frontend URL
		AllowMethods: "GET,POST,PUT,DELETE",   // Allowed HTTP methods
		AllowHeaders: "Origin, Content-Type, Accept, Authorization, Cookie", // Allowed headers
		ExposeHeaders: "Authorization, Cookie",
		AllowCredentials: true,
	}))

	// Public redirect route (no authentication required)
	app.Get("/:shortlink", rest.RedirectURL)

	// Grouped API routes
	api := app.Group("/api/v1")

	// User routes
	api.Get("/users", middleware.ValidateToken, middleware.AuditMiddleware("GET", "users"), rest.GetAllUsers)        // Fetch all users
	api.Get("/users/:id", middleware.ValidateToken, middleware.AuditMiddleware("GET", "users"), rest.GetUserByID)    // Fetch a specific user by ID
	api.Post("/users/login", middleware.AuditMiddleware("POST", "users"), rest.Login)                                 // Login user
	api.Post("/users/logout", middleware.ValidateToken, middleware.AuditMiddleware("POST", "users"), rest.Logout)    // Logout user
	api.Post("/users/register", middleware.AuditMiddleware("POST", "users"), rest.Register)                           // Register a new user
	api.Put("/users/:id", middleware.ValidateToken, middleware.AuditMiddleware("PUT", "users"), rest.UpdateUser)     // Update user info
	api.Delete("/users/:id", middleware.ValidateToken, middleware.AuditMiddleware("DELETE", "users"), rest.DeleteUser) // Delete a user

	// URL routes
	api.Get("/urls", middleware.ValidateToken, middleware.AuditMiddleware("GET", "urls"), rest.GetURLs)              // Fetch all URLs for the logged-in user
	api.Get("/urls/:id", middleware.ValidateToken, middleware.AuditMiddleware("GET", "urls"), rest.GetURLbyID)   // Fetch short URL by ID
	api.Post("/urls", middleware.ValidateToken, middleware.AuditMiddleware("POST", "urls"), rest.GenerateURL)        // Generate a new short URL
	api.Put("/urls/:id", middleware.ValidateToken, middleware.AuditMiddleware("PUT", "urls"), rest.EditShortLink) // Update an existing short URL
	api.Delete("/urls/:id", middleware.ValidateToken, middleware.AuditMiddleware("DELETE", "urls"), rest.DeleteURL) // Delete a short URL

	// Analytics routes
	api.Get("/analytics", middleware.ValidateToken, middleware.AuditMiddleware("GET", "analytics"), rest.GetGlobalAnalytics) // Fetch global analytics
	api.Get("/analytics/:id", middleware.ValidateToken, middleware.AuditMiddleware("GET", "analytics"), rest.GetAnalyticsByURL) // Fetch analytics for a specific URL
	
}
