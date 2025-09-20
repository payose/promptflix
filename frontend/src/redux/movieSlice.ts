import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import APIService from "@/api/axios";
import type { Movie } from "@/types/movie";

interface MovieState {
  loading: boolean;
  movies: Movie[];
  movieSection: Movie[];
  sectionResults: Record<string, Movie[]>;
  searchResults: Record<string, Movie[]>;
  sectionLoading: boolean;
  sectionError: string | null;
  error: string | null;
}

const initialState: MovieState = {
  loading: false,
  movies: [],
  movieSection: [],
  sectionResults: {},
  searchResults: {},
  sectionLoading: false,
  sectionError: null,
  error: null,
};

/**
 * Fetch detailed movies for a user query
 * - Calls FastAPI endpoint: GET /movies/search?query=xyz
 */
export const queryMovies = createAsyncThunk(
  "movies/queryMovies",
  async (query: string, { getState, rejectWithValue }) => {
    const state = getState() as { movies: MovieState };

    // return cached if available
    if (state.movies.searchResults[query]) {
      return { query, movies: state.movies.searchResults[query] };
    }

    try {
      const response = await APIService.getInstance("backend").get(`/movies/search`, {
        params: { query },
      });
      return { query, movies: response.data.movies as Movie[] };
    } catch (error: unknown) {
      if (error instanceof Error) return rejectWithValue(error.message);
      return rejectWithValue("Unknown error");
    }
  }
);

/**
 * Fetch movie section results (e.g. "Top Sci-Fi")
 * - Calls FastAPI endpoint: GET /movies/section?query=xyz
 */
export const sectionQuery = createAsyncThunk(
  "movies/sectionQuery",
  async (query: string, { getState, rejectWithValue }) => {
    const state = getState() as { movies: MovieState };

    // return cached if available
    if (state.movies.sectionResults[query]) {
      return { query, movies: state.movies.sectionResults[query] };
    }

    try {
      const response = await APIService.getInstance("backend").get(`/movies/section`, {
        params: { query },
      });
      return { query, movies: response.data.movies as Movie[] };
    } catch (error: unknown) {
      if (error instanceof Error) return rejectWithValue(error.message);
      return rejectWithValue("Unknown error");
    }
  }
);

const movieSlice = createSlice({
  name: "movies",
  initialState,
  reducers: {
    resetMovies: (state) => {
      state.movies = [];
      state.error = null;
    },
    resetMovieSection: (state) => {
      state.movieSection = [];
      state.sectionError = null;
    },
    clearSectionCache: (state) => {
      state.sectionResults = {};
    },
    clearSearchCache: (state) => {
      state.searchResults = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // queryMovies
      .addCase(queryMovies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        queryMovies.fulfilled,
        (state, action: PayloadAction<{ query: string; movies: Movie[] }>) => {
          state.loading = false;
          state.movies = action.payload.movies;
          state.searchResults[action.payload.query] = action.payload.movies;
        }
      )
      .addCase(queryMovies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // sectionQuery
      .addCase(sectionQuery.pending, (state) => {
        state.sectionLoading = true;
        state.sectionError = null;
      })
      .addCase(
        sectionQuery.fulfilled,
        (state, action: PayloadAction<{ query: string; movies: Movie[] }>) => {
          state.sectionLoading = false;
          state.movieSection = action.payload.movies;
          state.sectionResults[action.payload.query] = action.payload.movies;
        }
      )
      .addCase(sectionQuery.rejected, (state, action) => {
        state.sectionLoading = false;
        state.sectionError = action.payload as string;
      });
  },
});

export const {
  resetMovies,
  resetMovieSection,
  clearSearchCache,
  clearSectionCache,
} = movieSlice.actions;

export default movieSlice.reducer;
