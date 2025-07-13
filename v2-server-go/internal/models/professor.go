package models

type Tag struct {
	Name *string `json:"name,omitempty"`
}

type Comment struct {
	Course  *string `json:"course,omitempty"`
	Date    *string `json:"date,omitempty"`
	Comment *string `json:"comment,omitempty"`
	WTA     *string `json:"wta,omitempty"`
}

type ProfessorInfo struct {
	FirstName             *string   `json:"firstName,omitempty"`
	LastName              *string   `json:"lastName,omitempty"`
	LegacyId              *string   `json:"legacyId,omitempty"`
	AvgRating             *float64  `json:"avgRating,omitempty"`
	AvgDifficulty         *float64  `json:"avgDifficulty,omitempty"`
	WouldTakeAgainPercent *float64  `json:"wouldTakeAgainPercent,omitempty"` // -1 will denote not available
	Department            *string   `json:"department,omitempty"`
	NumRatings            *int      `json:"numRatings,omitempty"`
	UserCards             []Comment `json:"userCards"`
	Tags                  []Tag     `json:"tags"`
	LastUpdated           *string   `json:"lastUpdated,omitempty"`
}

type SearchQuery struct {
	Text     string `json:"text"`
	SchoolID string `json:"schoolID"`
	Fallback bool   `json:"fallback"`
}

type SearchPayload struct {
	OperationName string `json:"operationName"`
	Query         string `json:"query"`
	Variables     struct {
		Query SearchQuery `json:"query"`
	} `json:"variables"`
}

type TeacherRatingsPayload struct {
	OperationName string `json:"operationName"`
	Query         string `json:"query"`
	Variables     struct {
		ID string `json:"id"`
	} `json:"variables"`
}

type School struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type Teacher struct {
	ID        string `json:"id"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	School    School `json:"school"`
}

type Edge struct {
	Node Teacher `json:"node"`
}

type Teachers struct {
	Edges []Edge `json:"edges"`
}

type NewSearch struct {
	Teachers Teachers `json:"teachers"`
}

type SearchResponse struct {
	Data struct {
		NewSearch NewSearch `json:"newSearch"`
	} `json:"data"`
	Errors []struct {
		Message string `json:"message"`
	} `json:"errors,omitempty"`
}

type Rating struct {
	Class            string `json:"class"`
	Comment          string `json:"comment"`
	Date             string `json:"date"`
	WouldTakeAgain   *int   `json:"wouldTakeAgain"`
	ClarityRating    int    `json:"clarityRating"`
	HelpfulRating    int    `json:"helpfulRating"`
	DifficultyRating int    `json:"difficultyRating"`
	RatingTags       string `json:"ratingTags"`
}

type RatingEdge struct {
	Node Rating `json:"node"`
}

type Ratings struct {
	Edges []RatingEdge `json:"edges"`
}

type TeacherRatingTag struct {
	TagName  string `json:"tagName"`
	TagCount int    `json:"tagCount"`
}

type TeacherDetails struct {
	FirstName             string             `json:"firstName"`
	LastName              string             `json:"lastName"`
	LegacyId              int                `json:"legacyId"`
	AvgRating             float64            `json:"avgRating"`
	AvgDifficulty         float64            `json:"avgDifficulty"`
	WouldTakeAgainPercent float64            `json:"wouldTakeAgainPercent"`
	Department            string             `json:"department"`
	NumRatings            int                `json:"numRatings"`
	Ratings               Ratings            `json:"ratings"`
	TeacherRatingTags     []TeacherRatingTag `json:"teacherRatingTags"`
}

type TeacherRatingsResponse struct {
	Data struct {
		Node TeacherDetails `json:"node"`
	} `json:"data"`
	Errors []struct {
		Message string `json:"message"`
	} `json:"errors,omitempty"`
}
