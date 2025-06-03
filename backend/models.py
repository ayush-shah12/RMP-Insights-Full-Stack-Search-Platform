from pydantic import BaseModel, Field

class Tag(BaseModel):
    name: str | None = None

class Comment(BaseModel):
    course: str | None = None
    date: str | None = None
    comment: str | None = None
    wta: str | None = None

class ProfessorInfo(BaseModel):
    firstName: str | None = None
    lastName: str | None = None
    legacyId: str | None = None
    avgRating: float | None = None
    avgDifficulty: float | None = None
    wouldTakeAgainPercent: str | None = None
    department: str | None = None
    num_ratings: int | None = None
    userCards: list[Comment] = Field(default_factory=list)
    tags: list[Tag] = Field(default_factory=list)
    
    