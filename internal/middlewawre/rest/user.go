package rest


import "github.com/gofiber/fiber/v2"

func LoginHandler(c *fiber.Ctx) error {
	type LoginReq struct{
		Username string `json:"username"`
		Password string `json:"password"`
	}

	req := new(LoginReq)
	if err := c.BodyParser(req); err != nil {
		return c.Status(fiber.StatusBadRequest).
				JSON(map[string]any{
					"message" : "Invalid Body",
					"status": fiber.StatusBadRequest,
					"data": req,
			})
}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Test1",
		"status": fiber.StatusOK,
		"data": req,
	})
}

func SignUpHandler(c *fiber.Ctx) error {
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Test2",
		"status": "200 OK",
	})
