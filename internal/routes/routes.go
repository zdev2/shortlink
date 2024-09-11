package routes

import (
	"shortlink/internal/middlewawre/rest"

	"github.com/gofiber/fiber/v2"
)

func RouteSetup(app *fiber.App) {
	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"message": "route test",
		})
	})

	api := app.Group("/api")

	api.Get("/user", nil)
	api.Get("/url",nil)
	api.Get("/id",nil)
	api.Get("/analytics",nil)
	api.Post("/userlogin",rest.LoginHandler)
	api.Post("/url",nil)
	api.Post("/qrcode",nil)
	api.Put("/url",nil)
	api.Delete("/url",nil)
}

/*
// Get: User, URL, URL/:id, Analytics
// Post: UserLogin, URL, QRCode
// Put: URL
// Delete: URL
*/