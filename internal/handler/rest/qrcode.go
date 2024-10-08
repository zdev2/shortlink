package rest

import "github.com/gofiber/fiber/v2"

func GenerateQRCode(c *fiber.Ctx) error {
	return OK(c, nil)
}