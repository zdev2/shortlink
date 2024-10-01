package rest

import "github.com/gofiber/fiber/v2"

func GenerateURL(c *fiber.Ctx) error{
	return OK(c, fiber.Map{
		"message": "yes",
	})
}