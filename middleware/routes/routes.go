package middleware

import "github.com/gofiber/fiber/v2"

func RouteSetup(app *fiber.App) {
	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"message": "Hello World!",
		})
	})
}