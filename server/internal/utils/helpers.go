package utils

import (
	"fmt"
	"strconv"

	"github.com/ayushshah12/rmp-insights-full-stack-search-platform/rmp-server/internal/models"
)

func ConvertToWTAString(wta *int) *string {
	if wta == nil {
		return nil
	}
	switch *wta {
	case 1:
		result := "Yes"
		return &result
	case 0:
		result := "No"
		return &result
	default:
		return nil
	}
}

func ConvertTeacherToProfessorInfo(teacher models.TeacherDetails) *models.ProfessorInfo {
	// Convert legacy ID to string
	legacyIdStr := strconv.Itoa(teacher.LegacyId)

	// Handle potential division by zero or invalid percentage
	var wtaPercentStr string
	if teacher.WouldTakeAgainPercent >= 0 && teacher.WouldTakeAgainPercent <= 100 {
		wtaPercentStr = fmt.Sprintf("%.1f", teacher.WouldTakeAgainPercent)
	} else {
		wtaPercentStr = "N/A"
	}

	// Convert comments
	var userCards []models.Comment
	for _, edge := range teacher.Ratings.Edges {
		rating := edge.Node
		wtaStr := ConvertToWTAString(rating.WouldTakeAgain)

		// Handle empty strings
		course := rating.Class
		if course == "" {
			course = "N/A"
		}
		comment := rating.Comment
		if comment == "" {
			comment = "No comment provided"
		}
		date := rating.Date
		if date == "" {
			date = "N/A"
		}

		commentObj := models.Comment{
			Course:  &course,
			Date:    &date,
			Comment: &comment,
			WTA:     wtaStr,
		}
		userCards = append(userCards, commentObj)
	}

	var tags []models.Tag
	for _, tag := range teacher.TeacherRatingTags {
		tagName := tag.TagName
		if tagName != "" {
			tags = append(tags, models.Tag{Name: &tagName})
		}
	}

	if userCards == nil {
		userCards = []models.Comment{}
	}
	if tags == nil {
		tags = []models.Tag{}
	}

	return &models.ProfessorInfo{
		FirstName:             &teacher.FirstName,
		LastName:              &teacher.LastName,
		LegacyId:              &legacyIdStr,
		AvgRating:             &teacher.AvgRating,
		AvgDifficulty:         &teacher.AvgDifficulty,
		WouldTakeAgainPercent: &wtaPercentStr,
		Department:            &teacher.Department,
		NumRatings:            &teacher.NumRatings,
		UserCards:             userCards,
		Tags:                  tags,
	}
}
