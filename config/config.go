package config

import (
	"github.com/joho/godotenv"
	"github.com/sirupsen/logrus"
)

func InitEnv() {
	err := godotenv.Load(".env.production")
	if err != nil {
		logrus.Warn("Cannot load env file, using system env")
	}
}

