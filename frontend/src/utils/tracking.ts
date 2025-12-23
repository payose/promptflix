import APIService from '@/api/axios';

/**
 * Track when a user clicks on a movie
 * @param movieId - The TMDB ID of the movie
 * @param movieTitle - The title of the movie
 */
export const trackMovieClick = async (movieId: number, movieTitle: string): Promise<void> => {
    try {
        const backendApi = APIService.getInstance('backend');
        await backendApi.post('/track/click', {
            movie_id: movieId,
            movie_title: movieTitle
        });
    } catch (error) {
        // Silently fail - don't disrupt user experience if tracking fails
        console.error('Failed to track movie click:', error);
    }
};
