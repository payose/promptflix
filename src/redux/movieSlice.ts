import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import APIService from "@/api/axios";
import type { Movie } from '@/types/movie';

interface MovieState {
  loading: boolean;
  movies: Movie[];
  error: string | null;
}


const initialState: MovieState = {
  loading: false,
  movies: [],
  error: null,
};

// Async action
export const fetchMoviesResults = createAsyncThunk("movie/fetchMoviesResults", async (movieList, { rejectWithValue }) => {
  try {
    const moviePromises = movieList.map(async (result) => {
      const response = await APIService.getInstance("tmdb").get(`/search/movie?query=${result.title}&year=${result.year}`);

      if (response.data.results?.length > 0) {

        const transformedMovie: Movie = response.data.results[0];
        return transformedMovie;
      }
      return null;
    });

    const newMovies = await Promise.all(moviePromises);
    return newMovies.filter((movie): movie is Movie => movie !== null);
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch movies");
  }
});

// Movie Slice
const movieSlice = createSlice({
  name: "movieResults",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMoviesResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMoviesResults.fulfilled, (state, action: PayloadAction<Movie[]>) => {
        state.loading = false;
        state.movies = action.payload;
      })
      .addCase(fetchMoviesResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default movieSlice.reducer;
