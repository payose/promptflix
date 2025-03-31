import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import APIService from "@/api/axios";
import type { Movie } from '@/types/movie';

interface MovieState {
  loading: boolean;
  movies: Movie[];
  error: string | null;
}

const movieList = [
  { title: "Little Women", year: 2019 },
  { title: "Promising Young Woman", year: 2020 },
  { title: "Nomadland", year: 2021 },
  { title: "Wonder Woman 1984", year: 2020 },
  { title: "Captain Marvel", year: 2019 },
  { title: "The Woman King", year: 2022 },
  { title: "Everything Everywhere All at Once", year: 2022 },
  { title: "Mulan", year: 2020 },
  { title: "Birds of Prey", year: 2020 },
  { title: "Black Widow", year: 2021 },
];

const initialState: MovieState = {
  loading: false,
  movies: [],
  error: null,
};

// Async action
export const fetchMoviesResults = createAsyncThunk("movie/fetchMoviesResults", async (_, { rejectWithValue }) => {
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
