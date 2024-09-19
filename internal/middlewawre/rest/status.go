package rest

import (
	"time"

	"github.com/gofiber/fiber/v2"
)

func BadRequest(c *fiber.Ctx, errLocate string) error {
	return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
		"status":    fiber.StatusBadRequest,
		"error_location": errLocate,
		"message":   "Bad Request",
		"timestamp": time.Now(),
		"data":      nil,
	})
}

func NotFound(c *fiber.Ctx, errLocate string) error {
	return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
		"status":    fiber.StatusNotFound,
		"error_location": errLocate,
		"message":   "Not Found",
		"timestamp": time.Now(),
		"data":      nil,
	})
}

func InternalServerError(c *fiber.Ctx, errLocate string) error {
	return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
		"status":    fiber.StatusInternalServerError,
		"error_location": errLocate,
		"message":   "Internal Server Error",
		"timestamp": time.Now(),
		"data":      nil,
	})
}

func OK(c *fiber.Ctx, data any) error {
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status":    fiber.StatusOK,
		"error_location": nil,
		"message":   "Success",
		"timestamp": time.Now(),
		"data":      data,
	})
}

func Created(c *fiber.Ctx, data any, errLocate string) error {
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"status":    fiber.StatusCreated,
		"error_location": errLocate,
		"message":   "Resource Created",
		"timestamp": time.Now(),
		"data":      data,
	})
}

func Unauthorized(c *fiber.Ctx, errLocate string) error {
	return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
		"status":    fiber.StatusUnauthorized,
		"error_location": errLocate,
		"message":   "Unauthorized",
		"timestamp": time.Now(),
		"data":      nil,
	})
}

func Forbidden(c *fiber.Ctx, errLocate string) error {
	return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
		"status":    fiber.StatusForbidden,
		"error_location": errLocate,
		"message":   "Forbidden",
		"timestamp": time.Now(),
		"data":      nil,
	})
}

func Conflict(c *fiber.Ctx, errLocate string) error {
	return c.Status(fiber.StatusConflict).JSON(fiber.Map{
		"status":    fiber.StatusConflict,
		"error_location": errLocate,
		"message":   "Conflict",
		"timestamp": time.Now(),
		"data":      nil,
	})
}

func NoContent(c *fiber.Ctx, errLocate string) error {
	return c.Status(fiber.StatusNoContent).JSON(fiber.Map{
		"status":    fiber.StatusNoContent,
		"error_location": errLocate,
		"message":   "No Content",
		"timestamp": time.Now(),
		"data":      nil,
	})
}

func UnprocessableEntity(c *fiber.Ctx, errLocate string) error {
	return c.Status(fiber.StatusUnprocessableEntity).JSON(fiber.Map{
		"status":    fiber.StatusUnprocessableEntity,
		"error_location": errLocate,
		"message":   "Unprocessable Entity",
		"timestamp": time.Now(),
		"data":      nil,
	})
}
