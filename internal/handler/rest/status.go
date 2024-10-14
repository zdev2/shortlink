package rest

import (
	"time"

	"github.com/gofiber/fiber/v2"
)

// Helper function to build response
func jsonResponse(c *fiber.Ctx, statusCode int, message string, errLocate string, data any) error {
	response := fiber.Map{
		"status":    statusCode,
		"message":   message,
		"timestamp": time.Now().Format(time.RFC3339),
	}

	// Only include error_location if it's not empty
	if errLocate != "" {
		response["error_location"] = errLocate
	}

	// Only include data if it's not nil
	if data != nil {
		response["data"] = data
	}

	return c.Status(statusCode).JSON(response)
}

func BadRequest(c *fiber.Ctx, errLocate string) error {
	return jsonResponse(c, fiber.StatusBadRequest, "Bad Request", errLocate, nil)
}

func NotFound(c *fiber.Ctx, errLocate string) error {
	return jsonResponse(c, fiber.StatusNotFound, "Not Found", errLocate, nil)
}

func InternalServerError(c *fiber.Ctx, errLocate string) error {
	return jsonResponse(c, fiber.StatusInternalServerError, "Internal Server Error", errLocate, nil)
}

func OK(c *fiber.Ctx, data any) error {
	return jsonResponse(c, fiber.StatusOK, "Success", "", data)
}

func Created(c *fiber.Ctx, data any, errLocate string) error {
	return jsonResponse(c, fiber.StatusCreated, "Resource Created", errLocate, data)
}

func Unauthorized(c *fiber.Ctx, errLocate string) error {
	return jsonResponse(c, fiber.StatusUnauthorized, "Unauthorized", errLocate, nil)
}

func Forbidden(c *fiber.Ctx, errLocate string) error {
	return jsonResponse(c, fiber.StatusForbidden, "Forbidden", errLocate, nil)
}

func Conflict(c *fiber.Ctx, errLocate string) error {
	return jsonResponse(c, fiber.StatusConflict, "Conflict", errLocate, nil)
}

func NoContent(c *fiber.Ctx, errLocate string) error {
	return jsonResponse(c, fiber.StatusNoContent, "No Content", errLocate, nil)
}

func UnprocessableEntity(c *fiber.Ctx, errLocate string) error {
	return jsonResponse(c, fiber.StatusUnprocessableEntity, "Unprocessable Entity", errLocate, nil)
}

func Accepted(c *fiber.Ctx, data any, errLocate string) error {
	return jsonResponse(c, fiber.StatusAccepted, "Accepted", errLocate, data)
}

func TooManyRequests(c *fiber.Ctx, errLocate string) error {
	return jsonResponse(c, fiber.StatusTooManyRequests, "Too Many Requests", errLocate, nil)
}

func NotImplemented(c *fiber.Ctx, errLocate string) error {
	return jsonResponse(c, fiber.StatusNotImplemented, "Not Implemented", errLocate, nil)
}

func ServiceUnavailable(c *fiber.Ctx, errLocate string) error {
	return jsonResponse(c, fiber.StatusServiceUnavailable, "Service Unavailable", errLocate, nil)
}

func Gone(c *fiber.Ctx, errLocate string) error {
	return jsonResponse(c, fiber.StatusGone, "Gone", errLocate, nil)
}
//
