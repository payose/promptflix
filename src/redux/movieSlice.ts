import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import APIService from "@/api/axios";
import type { Movie, MovieListItem } from "@/types/movie";

interface MovieState {
    loading: boolean;
    movies: Movie[];
    moviesList: Movie[];
    error: string | null;
}

const initialState: MovieState = {
    loading: false,
    movies: [],
    moviesList: [],
    error: null,
};

// ✅ Async action to fetch movie details from TMDB
export const fetchMoviesResults = createAsyncThunk(
    "movie/fetchMoviesResults",
    async (movie: MovieListItem, { rejectWithValue }) => {
        try {
            const response = await APIService.getInstance("tmdb").get(
                `/search/movie?query=${movie.title}&year=${movie.year}`
            );

            if (response.data.results?.length > 0) {
                return response.data.results[0] as Movie;
            }
            return rejectWithValue("No movie found");

        } catch (error: unknown) {
            if (error instanceof Error) {
                return rejectWithValue(error.message);
            }
            return rejectWithValue("An unknown error occurred");
        }
    }
);

export const queryAIforMovieList = createAsyncThunk(
    "movie/queryAIforMovieList",
    async (query: string, { dispatch, rejectWithValue }) => {
        try {
            const response = await APIService.getInstance("openai").post("/chat/completions", {
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content:
                            "You are a knowledgeable assistant with expertise in movies and TV shows. Your task is to recommend 10 movies based on the user's prompt. Each recommendation should be an object containing the movie title and the year of release. If there are multiple movies that match the user's criteria, prioritize those that are more recently released with higher ratings. Return the results as a JSON array of 10 objects, strictly adhering to this format: [{\"title\": \"Movie Title\", \"year\": 2023}, ...]. Do not include additional commentary or formatting.",
                    },
                    {
                        role: "user",
                        content: query,
                    },
                ],
            });

            const queryResult = response.data.choices[0].message.content;

            try {
                // ✅ Parse JSON safely
                const parsedMovies: MovieListItem[] = JSON.parse(queryResult.replace(/\n/g, "").trim());

                // ✅ Validate parsed data
                if (
                    Array.isArray(parsedMovies) &&
                    parsedMovies.every(
                        (movie) =>
                            movie.title && typeof movie.title === "string" &&
                            movie.year && typeof movie.year === "number"
                    )
                ) {
                    // ✅ Fetch movie details from TMDB
                    const moviePromises = parsedMovies.map((movie) =>
                        dispatch(fetchMoviesResults(movie)).unwrap()
                    );
                    const detailedMovies = await Promise.all(moviePromises);

                    return detailedMovies.filter((movie): movie is Movie => movie !== null);
                } else {
                    throw new Error("Invalid AI response format");
                }
            } catch (error) {
                return rejectWithValue("Failed to parse AI movie recommendations");
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                return rejectWithValue(error.message);
            }
            return rejectWithValue("An unknown error occurred");
        }
    }
);

const movieSlice = createSlice({
    name: "movieResults",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(queryAIforMovieList.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(queryAIforMovieList.fulfilled, (state, action: PayloadAction<Movie[]>) => {
                state.loading = false;
                state.moviesList = [...state.moviesList, ...action.payload];
            })
            .addCase(queryAIforMovieList.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchMoviesResults.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMoviesResults.fulfilled, (state, action: PayloadAction<Movie>) => {
                state.loading = false;
                state.movies = [...state.movies, action.payload];
            })
            .addCase(fetchMoviesResults.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default movieSlice.reducer;
