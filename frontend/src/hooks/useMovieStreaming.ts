import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import {
    setInitialMovies,
    updateMovieDetail,
    completeSectionLoading,
    setSectionFromCache,
    setInitialSearchMovies,
    updateSearchMovieDetail,
    completeSearchLoading,
    setSearchFromCache
} from '@/redux/movieSlice';

type StreamType = 'section' | 'search';

interface UseMovieStreamingOptions {
    type: StreamType;
    onComplete?: () => void;
    onError?: (error: string) => void;
}

export const useMovieStreaming = ({ type, onComplete, onError }: UseMovieStreamingOptions) => {
    const dispatch = useDispatch<AppDispatch>();

    const streamMovies = useCallback(async (query: string) => {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
        const endpoint = type === 'section'
            ? `/api/movies/section/stream`
            : `/api/movies/search/stream`;

        const eventSource = new EventSource(
            `${backendUrl}${endpoint}?query=${encodeURIComponent(query)}`
        );

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                switch (data.type) {
                    case 'initial':
                        // Immediately show skeleton cards with titles
                        if (type === 'section') {
                            dispatch(setInitialMovies({
                                query: data.query,
                                movies: data.movies
                            }));
                        } else {
                            dispatch(setInitialSearchMovies({
                                query: data.query,
                                movies: data.movies
                            }));
                        }
                        break;

                    case 'detail':
                        // Update individual movie with full details
                        if (type === 'section') {
                            dispatch(updateMovieDetail({
                                query: data.query,
                                index: data.index,
                                movie: data.movie
                            }));
                        } else {
                            dispatch(updateSearchMovieDetail({
                                query: data.query,
                                index: data.index,
                                movie: data.movie
                            }));
                        }
                        break;

                    case 'complete':
                        // Handle cached results (all at once)
                        if (type === 'section') {
                            dispatch(setSectionFromCache({
                                query: data.query,
                                movies: data.movies
                            }));
                        } else {
                            dispatch(setSearchFromCache({
                                query: data.query,
                                movies: data.movies
                            }));
                        }
                        eventSource.close();
                        onComplete?.();
                        break;

                    case 'done':
                        // Mark as complete
                        if (type === 'section') {
                            dispatch(completeSectionLoading({ query: data.query }));
                        } else {
                            dispatch(completeSearchLoading({ query: data.query }));
                        }
                        eventSource.close();
                        onComplete?.();
                        break;

                    case 'error':
                        console.error('Streaming error:', data.message);
                        eventSource.close();
                        onError?.(data.message);
                        break;
                }
            } catch (error) {
                console.error('Error parsing SSE data:', error);
                eventSource.close();
                onError?.(String(error));
            }
        };

        eventSource.onerror = (error) => {
            console.error('EventSource error:', error);
            eventSource.close();
            onError?.('Connection error');
        };

        return eventSource;
    }, [dispatch, type, onComplete, onError]);

    return { streamMovies };
};
