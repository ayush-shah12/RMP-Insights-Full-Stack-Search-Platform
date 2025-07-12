package main

import (
	"log"

	"github.com/ayushshah12/rmp-insights-full-stack-search-platform/rmp-server/internal/cache"
	"github.com/ayushshah12/rmp-insights-full-stack-search-platform/rmp-server/internal/config"
	"github.com/ayushshah12/rmp-insights-full-stack-search-platform/rmp-server/internal/handlers"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Printf("No .env file found or error loading it: %v", err)
	}

	cfg := config.New()

	redisClient := cache.InitRedis()

	professorHandler := handlers.NewProfessorHandler(redisClient)

	app := fiber.New(fiber.Config{
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}
			return c.Status(code).JSON(fiber.Map{
				"error": err.Error(),
			})
		},
	})

	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders: "Origin,Content-Type,Accept,Authorization",
	}))

	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"message": "Rate My Professor API is running",
		})
	})

	app.Get("/get_professor_info", professorHandler.GetProfessorInfo)

	app.Get("/health", professorHandler.HealthCheck)

	port := cfg.Port
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on :%s...", port)
	if err := app.Listen(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
