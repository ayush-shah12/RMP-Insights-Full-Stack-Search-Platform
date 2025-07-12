package handlers

import (
	"fmt"
	"log"

	"github.com/ayushshah12/rmp-insights-full-stack-search-platform/rmp-server/internal/cache"
	"github.com/ayushshah12/rmp-insights-full-stack-search-platform/rmp-server/internal/services"
	"github.com/ayushshah12/rmp-insights-full-stack-search-platform/rmp-server/internal/utils"
	"github.com/gofiber/fiber/v2"
)

type ProfessorHandler struct {
	redisClient *cache.RedisClient
	rmpService  *services.RMPService
}

func NewProfessorHandler(redisClient *cache.RedisClient) *ProfessorHandler {
	return &ProfessorHandler{
		redisClient: redisClient,
		rmpService:  services.NewRMPService(),
	}
}

func (h *ProfessorHandler) GetProfessorInfo(c *fiber.Ctx) error {

	// get form data from post request
	profFirstName := c.FormValue("prof_first_name")
	profLastName := c.FormValue("prof_last_name")
	schoolCode := c.FormValue("school_code")
	forceRefresh := c.FormValue("force_refresh") == "true"

	if profFirstName == "" && profLastName == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "At least one of prof_first_name or prof_last_name is required",
		})
	}

	if schoolCode == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "school_code is required",
		})
	}

	log.Printf("Searching for professor: %s %s at school %s", profFirstName, profLastName, schoolCode)
	searchResponse, err := h.rmpService.SearchTeachers(profFirstName, profLastName, schoolCode)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": fmt.Sprintf("Error searching teachers: %v", err),
		})
	}

	bestMatch := h.rmpService.FindBestMatch(searchResponse.Data.NewSearch.Teachers.Edges, profFirstName, profLastName, schoolCode)
	if bestMatch == nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "No matching teacher found",
		})
	}

	cacheKey := h.redisClient.GenerateCacheKey(bestMatch.FirstName, bestMatch.LastName, schoolCode)
	log.Printf("Generated cache key: %s", cacheKey)

	if !forceRefresh {
		cachedInfo, err := h.redisClient.GetProfessorFromCache(cacheKey)
		if err != nil {
			log.Printf("Error getting from cache: %v", err)
		} else if cachedInfo != nil {
			log.Printf("Cache hit for professor: %s %s", bestMatch.FirstName, bestMatch.LastName)
			return c.JSON(fiber.Map{
				"data":       cachedInfo,
				"from_cache": true,
				"cache_key":  cacheKey,
			})
		}
	}

	log.Printf("Cache miss for professor: %s %s", bestMatch.FirstName, bestMatch.LastName)

	ratingsResponse, err := h.rmpService.GetTeacherRatings(bestMatch.ID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": fmt.Sprintf("Error getting teacher ratings: %v", err),
		})
	}

	teacher := ratingsResponse.Data.Node
	professorInfo := utils.ConvertTeacherToProfessorInfo(teacher)

	if err := h.redisClient.SetProfessorInCache(cacheKey, professorInfo); err != nil {
		log.Printf("Error setting cache: %v", err)
	} else {
		log.Printf("Cached professor info for: %s %s", teacher.FirstName, teacher.LastName)
	}

	return c.JSON(fiber.Map{
		"data":       professorInfo,
		"from_cache": false,
		"cache_key":  cacheKey,
	})
}

func (h *ProfessorHandler) ClearCache(c *fiber.Ctx) error {
	deleted, err := h.redisClient.ClearCache()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": fmt.Sprintf("Error clearing cache: %v", err),
		})
	}

	if deleted == 0 {
		return c.JSON(fiber.Map{
			"message": "No cache entries to clear",
			"cleared": deleted,
		})
	}

	return c.JSON(fiber.Map{
		"message": "Cache cleared successfully",
		"cleared": deleted,
	})
}

func (h *ProfessorHandler) GetCacheInfo(c *fiber.Ctx) error {
	keys, err := h.redisClient.GetCacheKeys()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": fmt.Sprintf("Error getting cache keys: %v", err),
		})
	}

	stats := h.redisClient.GetCacheStats()

	return c.JSON(fiber.Map{
		"cache_entries": len(keys),
		"cache_keys":    keys,
		"cache_ttl":     cache.CacheTTL.String(),
		"stats":         stats,
	})
}

func (h *ProfessorHandler) HealthCheck(c *fiber.Ctx) error {
	err := h.redisClient.Ping()
	if err != nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"status":  "error",
			"message": "Redis connection failed",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"status":  "ok",
		"message": "Rate My Professor API is running",
		"redis":   "connected",
	})
}
