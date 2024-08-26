package routes

import "github.com/gofiber/fiber/v2"

func RouteSetup(app *fiber.App) {
	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"message": "route test",
		})
	})

	app.Get("/user", nil)
	app.Get("/url",nil)
	app.Get("/id",nil)
	app.Get("/analytics",nil)
	app.Post("/userlogin",nil)
	app.Post("/url",nil)
	app.Post("/qrcode",nil)
	app.Put("/url",nil)
	app.Delete("/url",nil)
}

/*
// Get: User, URL, URL/:id, Analytics
// Post: UserLogin, URL, QRCode
// Put: URL
// Delete: URL
*/