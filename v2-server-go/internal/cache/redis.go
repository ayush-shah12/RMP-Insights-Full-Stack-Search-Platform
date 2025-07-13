package cache

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"github.com/ayushshah12/rmp-insights-full-stack-search-platform/rmp-server/internal/models"
	"github.com/redis/go-redis/v9"
)

var ctx = context.Background()

const (
	CacheTTL       = 14 * 24 * time.Hour
	CacheKeyPrefix = "rmp:professor:"
)

type RedisClient struct {
	client *redis.Client
}

func InitRedis() *RedisClient {
	redisURL := os.Getenv("REDISCLOUD_URL")
	if redisURL == "" {
		log.Fatal("REDISCLOUD_URL environment variable is not set")
	}

	opt, err := redis.ParseURL(redisURL)
	if err != nil {
		log.Fatal("Error parsing Redis URL:", err)
	}

	client := redis.NewClient(opt)

	_, err = client.Ping(ctx).Result()
	if err != nil {
		log.Fatal("Error connecting to Redis:", err)
	}

	log.Println("Connected to Redis successfully")

	return &RedisClient{
		client: client,
	}
}

func (r *RedisClient) GenerateCacheKey(firstName, lastName, schoolCode string) string {
	return fmt.Sprintf("%s%s_%s_%s", CacheKeyPrefix, strings.ToLower(firstName), strings.ToLower(lastName), schoolCode)
}

func (r *RedisClient) GetProfessorFromCache(cacheKey string) (*models.ProfessorInfo, error) {
	val, err := r.client.Get(ctx, cacheKey).Result()
	if err == redis.Nil {
		return nil, nil
	} else if err != nil {
		return nil, err
	}

	var professorInfo models.ProfessorInfo
	err = json.Unmarshal([]byte(val), &professorInfo)
	if err != nil {
		return nil, err
	}

	return &professorInfo, nil
}

func (r *RedisClient) SetProfessorInCache(cacheKey string, professorInfo *models.ProfessorInfo) error {
	// Set the current timestamp when caching
	currentTime := time.Now().UTC().Format(time.RFC3339)
	professorInfo.LastUpdated = &currentTime
	
	jsonData, err := json.Marshal(professorInfo)
	if err != nil {
		return err
	}

	err = r.client.Set(ctx, cacheKey, jsonData, CacheTTL).Err()
	return err
}

func (r *RedisClient) GetCacheStats() map[string]interface{} {
	info := r.client.Info(ctx, "stats").Val()
	return map[string]interface{}{
		"redis_info": info,
		"cache_ttl":  CacheTTL.String(),
	}
}

func (r *RedisClient) GetCacheKeys() ([]string, error) {
	pattern := CacheKeyPrefix + "*"
	keys, err := r.client.Keys(ctx, pattern).Result()
	if err != nil {
		return nil, err
	}
	return keys, nil
}

func (r *RedisClient) ClearCache() (int64, error) {
	pattern := CacheKeyPrefix + "*"
	keys, err := r.client.Keys(ctx, pattern).Result()
	if err != nil {
		return 0, err
	}

	if len(keys) == 0 {
		return 0, nil
	}

	deleted, err := r.client.Del(ctx, keys...).Result()
	if err != nil {
		return 0, err
	}

	return deleted, nil
}

func (r *RedisClient) Ping() error {
	_, err := r.client.Ping(ctx).Result()
	return err
}
