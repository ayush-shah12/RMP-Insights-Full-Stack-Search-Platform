export interface Comment {
    course?: string;
    date?: string;
    comment?: string;
    wta?: string;
  }

export interface Tag {
    name?: string;
}

export interface Professor {
    firstName?: string;
    lastName?: string;
    department?: string;
    numRatings?: number;
    rating?: number;
    difficulty?: number;
    takeAgainPercentage: number; // enforce -1 if no data
    tags?: Array<Tag>;
    comments?: Array<Comment>;
    lastUpdated: string;
  }

export interface ProfessorResultsProps extends Professor {
    onRefresh?: () => void;
    isLoading?: boolean;
  }

export interface School {
    name: string;
    id: number;
}
  