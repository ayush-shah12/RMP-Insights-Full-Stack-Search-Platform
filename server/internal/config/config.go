package config

import "os"

type Config struct {
	Port     string
	RedisURL string
}

func New() *Config {
	return &Config{
		Port:     os.Getenv("PORT"),
		RedisURL: os.Getenv("REDISCLOUD_URL"),
	}
}
