import { configureStore } from '@reduxjs/toolkit';
import movieReducer from "./movieSlice"
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";

const persistConfig = {
    key: "movies",
    storage,
  };
  
  const persistedMovieReducer = persistReducer(persistConfig, movieReducer);
  
  export const store = configureStore({
    reducer: {
      movies: persistedMovieReducer,
    },
  });
  
export const persistor = persistStore(store);