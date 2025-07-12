package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/ayushshah12/rmp-insights-full-stack-search-platform/rmp-server/internal/models"
)

const (
	SearchQueryString = `
query SearchTeachers($query: TeacherSearchQuery!) {
  newSearch {
    teachers(query: $query, first: 10) {
      edges {
        node {
          id
          firstName
          lastName
          school {
            id
            name
          }
        }
      }
    }
  }
}`

	TeacherRatingsQueryString = `
query TeacherRatingsPageQuery($id: ID!) {
  node(id: $id) {
    __typename
    ... on Teacher {
      id
      legacyId
      firstName
      lastName
      department
      avgRating
      avgDifficulty
      wouldTakeAgainPercent
      numRatings
      school {
        id
        legacyId
        name
        city
        state
      }
      ratingsDistribution {
        total
        r1
        r2
        r3
        r4
        r5
      }
      ratings(first: 20) {
        edges {
          node {
            id
            legacyId
            class
            comment
            date
            helpfulRating
            clarityRating
            difficultyRating
            wouldTakeAgain
            grade
            attendanceMandatory
            textbookUse
            isForOnlineClass
            isForCredit
            ratingTags
            thumbsUpTotal
            thumbsDownTotal
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
      teacherRatingTags {
        id
        legacyId
        tagName
        tagCount
      }
    }
  }
}`
)

type RMPService struct {
	httpClient *http.Client
}

func NewRMPService() *RMPService {
	return &RMPService{
		httpClient: &http.Client{
			Timeout: 20 * time.Second,
		},
	}
}

func (s *RMPService) makeGraphQLRequest(payload interface{}) (*http.Response, error) {
	jsonData, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest("POST", "https://www.ratemyprofessors.com/graphql", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}

	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36")
	req.Header.Set("Origin", "https://www.ratemyprofessors.com")
	req.Header.Set("Referer", "https://www.ratemyprofessors.com")
	req.Header.Set("Content-Type", "application/json")

	return s.httpClient.Do(req)
}

func (s *RMPService) SearchTeachers(firstName, lastName, schoolCode string) (*models.SearchResponse, error) {
	searchQuery := fmt.Sprintf("%s %s", firstName, lastName)

	payload := models.SearchPayload{
		OperationName: "SearchTeachers",
		Query:         SearchQueryString,
		Variables: struct {
			Query models.SearchQuery `json:"query"`
		}{
			Query: models.SearchQuery{
				Text:     searchQuery,
				SchoolID: schoolCode,
				Fallback: true,
			},
		},
	}

	resp, err := s.makeGraphQLRequest(payload)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("search request failed with status: %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var searchResponse models.SearchResponse
	if err := json.Unmarshal(body, &searchResponse); err != nil {
		return nil, err
	}

	if len(searchResponse.Errors) > 0 {
		return nil, fmt.Errorf("GraphQL errors: %v", searchResponse.Errors)
	}

	return &searchResponse, nil
}

func (s *RMPService) GetTeacherRatings(teacherID string) (*models.TeacherRatingsResponse, error) {
	payload := models.TeacherRatingsPayload{
		OperationName: "TeacherRatingsPageQuery",
		Query:         TeacherRatingsQueryString,
		Variables: struct {
			ID string `json:"id"`
		}{
			ID: teacherID,
		},
	}

	resp, err := s.makeGraphQLRequest(payload)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("teacher ratings request failed with status: %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var ratingsResponse models.TeacherRatingsResponse
	if err := json.Unmarshal(body, &ratingsResponse); err != nil {
		return nil, err
	}

	// Check for GraphQL errors
	if len(ratingsResponse.Errors) > 0 {
		return nil, fmt.Errorf("GraphQL errors: %v", ratingsResponse.Errors)
	}

	return &ratingsResponse, nil
}

func (s *RMPService) FindBestMatch(edges []models.Edge, firstName, lastName, schoolCode string) *models.Teacher {
	if len(edges) == 0 {
		return nil
	}

	teachers := make([]models.Teacher, len(edges))
	for i, edge := range edges {
		teachers[i] = edge.Node
	}

	if len(teachers) > 0 && teachers[0].School.ID == schoolCode {
		return &teachers[0]
	}

	for _, teacher := range teachers {
		if teacher.School.ID == schoolCode {
			if strings.EqualFold(teacher.FirstName, firstName) && strings.EqualFold(teacher.LastName, lastName) {
				return &teacher
			}
		}
	}

	for _, teacher := range teachers {
		if teacher.School.ID == schoolCode {
			return &teacher
		}
	}

	return nil
}
