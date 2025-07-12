package utils

import (
	// "fmt"
	"strconv"

	"github.com/ayushshah12/rmp-insights-full-stack-search-platform/rmp-server/internal/models"
)

func ConvertToWTAString(wta *int) *string {
	// return "N/A" rather than nil to enforce types

	if wta == nil {
		res := "N/A"
		return &res
	}
	switch *wta {
	case 1:
		result := "Yes"
		return &result
	case 0:
		result := "No"
		return &result
	default:
		result := "N/A"
		return &result
	}
}

func ConvertTeacherToProfessorInfo(teacher models.TeacherDetails) *models.ProfessorInfo {
	legacyIdStr := strconv.Itoa(teacher.LegacyId)

	// if wta percentage is not available, set to -1.0
	var wtaPercentStr float64
	if teacher.WouldTakeAgainPercent >= 0 && teacher.WouldTakeAgainPercent <= 100 {
		wtaPercentStr = teacher.WouldTakeAgainPercent
	} else {
		wtaPercentStr = -1.0
	}

	var userCards []models.Comment
	for _, edge := range teacher.Ratings.Edges {
		rating := edge.Node
		wtaStr := ConvertToWTAString(rating.WouldTakeAgain)

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
