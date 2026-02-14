import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import APIService from "@/api/axios";
import type { Movie } from "@/types/movie";

interface PartialMovie {
  title: string;
  year: number;
  isLoading?: boolean;
}

interface MovieState {
  loading: boolean;
  movies: Movie[];
  movieSection: Movie[];
  sectionResults: Record<string, Movie[]>;
  searchResults: Record<string, Movie[]>;
  sectionLoading: boolean;
  sectionError: string | null;
  error: string | null;
  // For progressive loading
  partialSections: Record<string, (Movie | PartialMovie)[]>;
  partialSearches: Record<string, (Movie | PartialMovie)[]>;
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
  partialSections: {},
  partialSearches: {},
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
 * - Calls FastAPI endpoint: GET /movies/search?query=xyz
 * - Note: Sections now use the same unified search endpoint
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
    // Start streaming actions
    startSectionStreaming: (state, action: PayloadAction<{ query: string }>) => {
      state.sectionLoading = true;
      state.sectionError = null;
      // Clear any existing partial data for this query
      delete state.partialSections[action.payload.query];
    },
    startSearchStreaming: (state, action: PayloadAction<{ query: string }>) => {
      state.loading = true;
      state.error = null;
      // Clear any existing partial data for this query
      delete state.partialSearches[action.payload.query];
    },
    // Error handling actions
    sectionStreamError: (state, action: PayloadAction<{ query: string; error: string }>) => {
      state.sectionLoading = false;
      state.sectionError = action.payload.error;
      delete state.partialSections[action.payload.query];
    },
    searchStreamError: (state, action: PayloadAction<{ query: string; error: string }>) => {
      state.loading = false;
      state.error = action.payload.error;
      delete state.partialSearches[action.payload.query];
    },
    // Progressive loading reducers - Sections
    setInitialMovies: (state, action: PayloadAction<{ query: string; movies: PartialMovie[] }>) => {
      state.partialSections[action.payload.query] = action.payload.movies.map(m => ({
        ...m,
        isLoading: true
      }));
      // Keep loading state true while streaming continues
    },
    updateMovieDetail: (state, action: PayloadAction<{ query: string; index: number; movie: Movie }>) => {
      const { query, index, movie } = action.payload;
      if (state.partialSections[query] && state.partialSections[query][index]) {
        state.partialSections[query][index] = movie;
      }
    },
    completeSectionLoading: (state, action: PayloadAction<{ query: string }>) => {
      const { query } = action.payload;
      if (state.partialSections[query]) {
        // Move from partial to full results
        state.sectionResults[query] = state.partialSections[query].filter(
          (m): m is Movie => 'id' in m && m.id !== undefined
        );
      }
      state.sectionLoading = false;
    },
    setSectionFromCache: (state, action: PayloadAction<{ query: string; movies: Movie[] }>) => {
      state.sectionResults[action.payload.query] = action.payload.movies;
      state.partialSections[action.payload.query] = action.payload.movies;
      state.sectionLoading = false;
    },
    // Progressive loading reducers - Search
    setInitialSearchMovies: (state, action: PayloadAction<{ query: string; movies: PartialMovie[] }>) => {
      state.partialSearches[action.payload.query] = action.payload.movies.map(m => ({
        ...m,
        isLoading: true
      }));
      // Keep loading state true while streaming continues
    },
    updateSearchMovieDetail: (state, action: PayloadAction<{ query: string; index: number; movie: Movie }>) => {
      const { query, index, movie } = action.payload;
      if (state.partialSearches[query] && state.partialSearches[query][index]) {
        state.partialSearches[query][index] = movie;
      }
    },
    completeSearchLoading: (state, action: PayloadAction<{ query: string }>) => {
      const { query } = action.payload;
      if (state.partialSearches[query]) {
        // Move from partial to full results
        state.searchResults[query] = state.partialSearches[query].filter(
          (m): m is Movie => 'id' in m && m.id !== undefined
        );
        state.movies = state.searchResults[query];
      }
      state.loading = false;
    },
    setSearchFromCache: (state, action: PayloadAction<{ query: string; movies: Movie[] }>) => {
      state.searchResults[action.payload.query] = action.payload.movies;
      state.partialSearches[action.payload.query] = action.payload.movies;
      state.movies = action.payload.movies;
      state.loading = false;
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
  startSectionStreaming,
  startSearchStreaming,
  sectionStreamError,
  searchStreamError,
  setInitialMovies,
  updateMovieDetail,
  completeSectionLoading,
  setSectionFromCache,
  setInitialSearchMovies,
  updateSearchMovieDetail,
  completeSearchLoading,
  setSearchFromCache,
} = movieSlice.actions;

export default movieSlice.reducer;
