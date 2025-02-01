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