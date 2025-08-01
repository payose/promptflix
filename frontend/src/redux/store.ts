import { configureStore } from '@reduxjs/toolkit';
import movieReducer from "./movieSlice"
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";
import { FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';

const persistConfig = {
    key: "movies",
    storage,
    whitelist: ['moviesList'], // Only persist moviesList
    blacklist: ['loading', 'error'], // Don't persist loading and error states
};

const persistedMovieReducer = persistReducer(persistConfig, movieReducer);

export const store = configureStore({
    reducer: {
        movies: persistedMovieReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;