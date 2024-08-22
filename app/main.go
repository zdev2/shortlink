package main

import (
	"shortlink/config"
	"shortlink/routes"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/template/html/v2"
	"github.com/sirupsen/logrus"
)

func main() {
	config.InitEnv()
	engine := html.New("./template", ".html") // Path to templates and file extension
	app := fiber.New(fiber.Config{
		Views: engine,
	})
	app.Static("/", "./template/home")
	app.Static("/src", "./src")

	// initial route
	routes.RouteSetup(app)

	// open fiber on http://localhost:3000
	err := app.Listen(":3000")
	if err != nil {
		logrus.Fatal(
			"Error on running fiber, ",
			err.Error())
	}
}