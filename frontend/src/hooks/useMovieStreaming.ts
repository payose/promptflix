import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import {
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

    const streamMovies = useCallback(async (query: string, filter?: string) => {
        // Set loading state to true before starting the stream
        if (type === 'section') {
            dispatch(startSectionStreaming({ query }));
        } else {
            dispatch(startSearchStreaming({ query }));
        }

        // Use the same base URL as the axios configuration
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
        // Both section and search now use the same endpoint
        const endpoint = `/movies/search/stream`;

        // Build query parameters
        const params = new URLSearchParams();
        params.set('query', query);
        if (filter) {
            params.set('filter', filter);
        }

        // Get session_id from cookie and pass it as query param
        // EventSource doesn't send cookies automatically, so we need to pass it manually
        const sessionId = document.cookie
            .split('; ')
            .find(row => row.startsWith('session_id='))
            ?.split('=')[1];

        if (sessionId) {
            params.set('session_id', sessionId);
        }

        const eventSource = new EventSource(
            `${baseUrl}${endpoint}?${params.toString()}`
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

                    case 'error': {
                        console.error('Streaming error:', data.message);
                        // Provide user-friendly error messages
                        let userMessage = data.message || 'An error occurred while fetching movies';

                        // Check for specific error types
                        if (data.message?.toLowerCase().includes('rate limit')) {
                            userMessage = 'We\'re experiencing high demand. Please try again in a few moments.';
                        }

                        if (type === 'section') {
                            dispatch(sectionStreamError({ query: data.query || query, error: userMessage }));
                        } else {
                            dispatch(searchStreamError({ query: data.query || query, error: userMessage }));
                        }
                        eventSource.close();
                        onError?.(userMessage);
                        break;
                    }
                }
            } catch (error) {
                console.error('Error parsing SSE data:', error);
                const userMessage = 'An error occurred while processing movie data. Please try again.';
                if (type === 'section') {
                    dispatch(sectionStreamError({ query, error: userMessage }));
                } else {
                    dispatch(searchStreamError({ query, error: userMessage }));
                }
                eventSource.close();
                onError?.(userMessage);
            }
        };

        eventSource.onerror = (error) => {
            console.error('EventSource error:', error);
            const userMessage = 'Connection error. Please check your internet connection and try again.';
            if (type === 'section') {
                dispatch(sectionStreamError({ query, error: userMessage }));
            } else {
                dispatch(searchStreamError({ query, error: userMessage }));
            }
            eventSource.close();
            onError?.(userMessage);
        };

        return eventSource;
    }, [dispatch, type, onComplete, onError]);

    return { streamMovies };
};
