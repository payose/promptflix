export interface Movie {
    id: string;
    title: string;
    release_date: string;
    overview: string;
    vote_average: number;
    genres: string[];
    posterPath: string;
    backdrop_path?: string;
    genre_ids?: number[];
    popularity?: number;
    vote_count?: number;
    adult?: boolean;
    original_language?: string;
    original_title?: string;
}
  