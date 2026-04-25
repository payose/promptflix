import { useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
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
    setSearchFromCache,
    setRateLimitInfo
} from '@/redux/movieSlice';

type StreamType = 'section' | 'search';

interface UseMovieStreamingOptions {
    type: StreamType;
    onComplete?: () => void;
    onError?: (error: string) => void;
}

export const useMovieStreaming = ({ type, onComplete, onError }: UseMovieStreamingOptions) => {
    const dispatch = useDispatch<AppDispatch>();
    const lastRateLimitMessageRef = useRef<string | null>(null);

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
        params.set('source', type);
        if (filter) {
            params.set('filter', filter);
        }

        const eventSource = new EventSource(
            `${baseUrl}${endpoint}?${params.toString()}`,
            { withCredentials: true }
        );

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data.rate_limit) {
                    dispatch(setRateLimitInfo(data.rate_limit));

                    const limitMessage = data.rate_limit.message;
                    const limitStatus = data.rate_limit.status;
                    const shouldNotify =
                        data.rate_limit.shouldNotify &&
                        limitMessage &&
                        (limitStatus === 'warning' || limitStatus === 'exceeded') &&
                        limitMessage !== lastRateLimitMessageRef.current;

                    if (shouldNotify) {
                        lastRateLimitMessageRef.current = limitMessage;

                        if (limitStatus === 'exceeded') {
                            toast.error(limitMessage, { id: 'rate-limit-status' });
                        } else {
                            toast.warning(limitMessage, { id: 'rate-limit-status' });
                        }
                    }
                }

                switch (data.type) {
                    case 'rate_limit':
                        break;

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
                        let userMessage = data.message || 'An error occurred while fetching movies';

                        if (data.rate_limit?.status === 'exceeded' && data.rate_limit.message) {
                            userMessage = data.rate_limit.message;
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
