export interface Movie {
    id: number | string; 
    title: string;
    release_date: string;
    overview: string;
    poster_path: string;
    backdrop_path?: string;
    genre_ids?: number[];
    video: boolean,
    vote_average: number;
    vote_count?: number;
    original_language?: string;
}

export interface ReviewAuthorDetails {
    name: string;
    username: string;
    avatar_path: string | null;
    rating: number | null;
}

export interface Review {
    author: string;
    author_details: ReviewAuthorDetails;
    content: string;
    created_at: string;
    id: string;
    updated_at: string;
    url: string;
}

export interface MovieQueryResult {
    title: string;
    year: number;
}