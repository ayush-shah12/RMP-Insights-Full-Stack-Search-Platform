export interface Comment {
    course: string;
    date: string;
    comment: string;
    wta: string;
  }

export interface Tag {
    tag: string;
}

export interface Professor {
    firstName: string;
    lastName: string;
    department: string;
    numRatings: number;
    rating: number;
    difficulty: number;
    takeAgainPercentage: number; // enforce -1 if no data
    tags: Array<Tag>;
    comments: Array<Comment>;
  }

export interface School {
    name: string;
    id: number;
}
  