import React, { useState, useEffect, useCallback } from 'react';
import { PlayCircle, Star, Clock, Film, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Movie, Review } from '@/types/movie';
import { useNavigate, useLocation } from 'react-router-dom';
import ReviewCard from "@/components/core/reviews"
import APIService from "@/api/axios"
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';

interface MovieDetails extends Movie {
    runtime: number;
    trailer_key?: string;
    genres: Array<{
        id: number;
        name: string;
    }>;
    belongs_to_collection: string;
    backdrop_path: string;
    tagline: string;
}

interface ReviewsResponse {
    id: number;
    page: number;
    results: Review[];
    total_pages: number;
    total_results: number;
}

interface WatchProvider {
    logo_path: string;
    provider_id: number;
    provider_name: string;
    display_priority: number;
}

interface CountryWatchProviders {
    link?: string;
    flatrate?: WatchProvider[];
}

interface WatchProvidersResponse {
    id: number;
    results: {
        [countryCode: string]: CountryWatchProviders;
    };
}

interface MovieDetailsModalProps {
    movieId: string | number;
    mediaType?: string;
}

const MovieDetailsModal: React.FC<MovieDetailsModalProps> = ({ movieId, mediaType = 'movie' }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [imageError, setImageError] = useState(false);
    const [details, setDetails] = useState<MovieDetails | null>(null);
    const [activeTrailer, setActiveTrailer] = useState<string | null>(null);
    const [reviews, setReviews] = useState<ReviewsResponse | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoadingReviews, setIsLoadingReviews] = useState(false);
    const [watchProviders, setWatchProviders] = useState<WatchProvidersResponse | null>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(true);

    const getYoutubeTrailer = async (title: string, mediaType?: string, releaseYear?: string) => {
        try {
            let searchQuery = title;

            if (releaseYear) {
                searchQuery += ` ${releaseYear}`;
            }

            if (mediaType === 'tv') {
                searchQuery += ' official trailer';
            } else {
                searchQuery += ' trailer';
            }

            const response = await APIService.getInstance('youtube').get(`/search?channelType=any&maxResults=1&q=${encodeURIComponent(searchQuery)}`);
            if (response.data.items && response.data.items[0]) {
                setActiveTrailer(response.data.items[0].id.videoId);
            }
        } catch (error) {
            console.error('Failed to fetch YouTube trailer', error);
        }
    }

    const fetchMovieDetails = useCallback(async (id: string | number, mediaType?: string) => {
        try {
            const params = mediaType ? { media_type: mediaType } : {};
            const response = await APIService.getInstance('backend').get(`/movies/${id}`, { params });
            const details: MovieDetails = response.data;
            setDetails(details);
        } catch (error) {
            console.error('Error fetching movie details:', error);
            throw error;
        }
    }, []);

    const fetchReviews = useCallback(async () => {
        setIsLoadingReviews(true);
        try {
            const params = mediaType ? { media_type: mediaType } : {};
            const response = await APIService.getInstance('backend').get(`/movies/${movieId}/reviews`, { params });
            setReviews(response.data);
        } catch (error) {
            console.error('Failed to fetch reviews', error);
        } finally {
            setIsLoadingReviews(false);
        }
    }, [movieId, mediaType]);

    const fetchWatchProviders = useCallback(async () => {
        try {
            const params = mediaType ? { media_type: mediaType } : {};
            const response = await APIService.getInstance('backend').get(`/movies/${movieId}/watch/providers`, { params });
            setWatchProviders(response.data);
        } catch (error) {
            console.error('Failed to fetch watch providers', error);
        }
    }, [movieId, mediaType]);

    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoadingDetails(true);
            try {
                const numericMovieId = Number(movieId);
                if (!movieId || isNaN(numericMovieId)) {
                    handleClose();
                    return;
                }

                await Promise.all([
                    fetchMovieDetails(movieId, mediaType),
                    fetchWatchProviders()
                ]);
            } catch (error) {
                console.error('Error loading movie data:', error);
                handleClose();
            } finally {
                setIsLoadingDetails(false);
            }
        };

        loadInitialData();
    }, [movieId, mediaType, fetchMovieDetails, fetchWatchProviders]);

    useEffect(() => {
        if (!isLoadingDetails && details) {
            fetchReviews();
        }
    }, [details, isLoadingDetails, fetchReviews, currentPage]);

    const handleClose = () => {
        // Check if there's a background location to go back to
        const state = location.state as { backgroundLocation?: Location };
        if (state?.backgroundLocation) {
            navigate(-1);
        } else {
            // If opened directly via URL, go to home
            navigate('/');
        }
    };

    return (
        <>
            <Dialog open={true} onOpenChange={(open) => !open && handleClose()}>
                <DialogContent>
                    <DialogClose onClose={handleClose} />

                    <div className="overflow-y-auto h-screen">
                        {/* Loading Skeleton */}
                        {isLoadingDetails && (
                            <div className="animate-pulse p-6">
                                <div className="grid md:grid-cols-[300px_1fr] gap-6">
                                    <div className="aspect-[2/3] bg-zinc-800 rounded-md" />
                                    <div className="space-y-4">
                                        <div className="h-8 bg-zinc-800 rounded w-3/4" />
                                        <div className="flex gap-4">
                                            <div className="h-6 bg-zinc-800 rounded w-20" />
                                            <div className="h-6 bg-zinc-800 rounded w-20" />
                                            <div className="h-6 bg-zinc-800 rounded w-32" />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="h-4 bg-zinc-800 rounded" />
                                            <div className="h-4 bg-zinc-800 rounded" />
                                            <div className="h-4 bg-zinc-800 rounded w-5/6" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Actual Content */}
                        {!isLoadingDetails && details && (
                            <div className="p-6">
                                <div className="grid md:grid-cols-[300px_1fr] gap-6 mb-8">
                                    {/* Poster */}
                                    <div>
                                        <img
                                            src={imageError ? `https://images.pexels.com/photos/29890776/pexels-photo-29890776/free-photo-of-traditional-vietnamese-new-year-gift-box.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=1`
                                                : `http://image.tmdb.org/t/p/w500/${details.backdrop_path}`}
                                            className='rounded-md w-full'
                                            alt={`${details.title} movie poster`}
                                            loading="eager"
                                            onError={() => setImageError(true)}
                                        />
                                    </div>

                                    {/* Movie Details */}
                                    <div className="text-gray-100">
                                        <h1 className="text-xl md:text-2xl font-bold mb-4">{details.title}</h1>

                                        {/* Quick Stats */}
                                        <div className="flex flex-wrap items-center text-sm gap-4 mb-4">
                                            <div className="flex items-center gap-2">
                                                <Star className="text-yellow-500 w-4 h-4" />
                                                <span>{details.vote_average.toFixed(1)}/10</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="text-red-500 w-4 h-4" />
                                                <span>{details.runtime} mins</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Film className="text-cyan-500 w-4 h-4" />
                                                <span>
                                                    {details.genres?.map(genre => genre.name).join(', ') || 'No genres'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Overview */}
                                        <p className="text-sm text-gray-300 mb-6">{details.overview}</p>

                                        {/* Trailer Button */}
                                        <button
                                            onClick={() => getYoutubeTrailer(
                                                details.title,
                                                mediaType,
                                                details.release_date ? new Date(details.release_date).getFullYear().toString() : undefined
                                            )}
                                            className="bg-amber-500 hover:bg-amber-600 text-sm text-black font-medium px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
                                        >
                                            <PlayCircle /> Watch Trailer
                                        </button>
                                    </div>
                                </div>

                                {/* Streaming Providers Section */}
                                {watchProviders && watchProviders.results.US && (
                                    <div className="mb-8">
                                        <h2 className="text-base text-gray-200 mb-4">
                                            Where to Stream
                                        </h2>

                                        <div className="space-y-6">
                                            {watchProviders.results.US.flatrate && watchProviders.results.US.flatrate.length > 0 ? (
                                                <div className="flex flex-wrap gap-4">
                                                    {watchProviders.results.US.flatrate.map(provider => (
                                                        <div key={provider.provider_id} className="flex flex-col items-center gap-2">
                                                            <img
                                                                src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                                                                alt={`Available on ${provider.provider_name}`}
                                                                className="w-12 h-12 rounded-lg"
                                                            />
                                                            <span className="text-xs text-gray-400 text-center max-w-[80px]">
                                                                {provider.provider_name}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-200">
                                                    No streaming providers available
                                                </p>
                                            )}
                                        </div>

                                        <p className="text-xs text-gray-500 mt-4">
                                            Streaming data provided by <a href="https://www.justwatch.com/" target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:underline">JustWatch</a>
                                        </p>
                                    </div>
                                )}

                                {/* Reviews Section */}
                                <div className="mt-8">
                                    <h2 className="text-lg text-gray-200 mb-4">
                                        Reviews {reviews && `(${reviews.total_results})`}
                                    </h2>

                                    {isLoadingReviews ? (
                                        <div className="text-center text-gray-400 py-8">
                                            Loading reviews...
                                        </div>
                                    ) : reviews?.results.length === 0 ? (
                                        <div className="text-center text-gray-400 py-8">No reviews yet</div>
                                    ) : (
                                        <>
                                            <div className="space-y-6">
                                                {reviews?.results.map(review => (
                                                    <ReviewCard key={review.id} review={review} />
                                                ))}
                                            </div>

                                            {/* Pagination */}
                                            {reviews && reviews.total_pages > 1 && (
                                                <div className="flex justify-center items-center gap-4 mt-8">
                                                    <button
                                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                        disabled={currentPage === 1}
                                                        className="p-2 rounded-lg bg-gray-800 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <ChevronLeft className="w-5 h-5" />
                                                    </button>
                                                    <span className="text-gray-300">
                                                        Page {currentPage} of {reviews.total_pages}
                                                    </span>
                                                    <button
                                                        onClick={() => setCurrentPage(p => Math.min(reviews.total_pages, p + 1))}
                                                        disabled={currentPage === reviews.total_pages}
                                                        className="p-2 rounded-lg bg-gray-800 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <ChevronRight className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Trailer Modal */}
                    {activeTrailer && (
                        <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4">
                            <div className="max-w-4xl w-full">
                                <button
                                    onClick={() => setActiveTrailer(null)}
                                    className="absolute top-4 right-4 text-white text-2xl hover:text-zinc-300 bg-black/50 w-10 h-10 flex items-center justify-center rounded-full"
                                >
                                    ✕
                                </button>
                                <iframe
                                    src={`https://www.youtube.com/embed/${activeTrailer}`}
                                    className="w-full aspect-video"
                                    title={`${details?.title} - Official Trailer`}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default MovieDetailsModal;
