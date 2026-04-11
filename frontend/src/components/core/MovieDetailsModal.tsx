import React, { useState, useEffect, useCallback } from 'react';
import { Play, Plus, ThumbsUp, ChevronLeft, ChevronRight } from 'lucide-react';
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

interface CastMember {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
}

interface CreditsResponse {
    id: number;
    cast: CastMember[];
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
    const [credits, setCredits] = useState<CreditsResponse | null>(null);

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

    const fetchCredits = useCallback(async () => {
        try {
            const params = mediaType ? { media_type: mediaType } : {};
            const response = await APIService.getInstance('backend').get(`/movies/${movieId}/credits`, { params });
            setCredits(response.data);
        } catch (error) {
            console.error('Failed to fetch credits', error);
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
                    fetchWatchProviders(),
                    fetchCredits()
                ]);
            } catch (error) {
                console.error('Error loading movie data:', error);
                handleClose();
            } finally {
                setIsLoadingDetails(false);
            }
        };

        loadInitialData();
    }, [movieId, mediaType, fetchMovieDetails, fetchWatchProviders, fetchCredits]);

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

                    <div className="h-screen">
                        {/* Loading Skeleton */}
                        {isLoadingDetails && (
                            <div className="animate-pulse">
                                <div className="h-[70vh] bg-zinc-800" />
                                <div className="p-12 space-y-4">
                                    <div className="h-8 bg-zinc-800 rounded w-3/4" />
                                    <div className="h-4 bg-zinc-800 rounded" />
                                    <div className="h-4 bg-zinc-800 rounded w-5/6" />
                                </div>
                            </div>
                        )}

                        {/* Actual Content */}
                        {!isLoadingDetails && details && (
                            <>
                                {/* Hero Section with Backdrop */}
                                <div className="relative h-[70vh] w-full overflow-hidden">
                                    {/* Backdrop Image */}
                                    <img
                                        src={imageError ? `https://images.pexels.com/photos/29890776/pexels-photo-29890776/free-photo-of-traditional-vietnamese-new-year-gift-box.jpeg?auto=compress&cs=tinysrgb&w=1200`
                                            : `http://image.tmdb.org/t/p/original/${details.backdrop_path}`}
                                        className='w-full h-full object-cover'
                                        alt={`${details.title} backdrop`}
                                        loading="eager"
                                        onError={() => setImageError(true)}
                                    />

                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/60 to-transparent" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#141414]/80 via-transparent to-transparent" />

                                    {/* Centered Pulsating Play Button */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <button
                                            onClick={() => getYoutubeTrailer(
                                                details.title,
                                                mediaType,
                                                details.release_date ? new Date(details.release_date).getFullYear().toString() : undefined
                                            )}
                                            className="group relative"
                                        >
                                            {/* Pulsating ring effect */}
                                            <div className="absolute inset-0 rounded-full bg-white/30 animate-ping" />
                                            <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse" />

                                            {/* Play button */}
                                            <div className="relative bg-white/90 hover:bg-white rounded-full p-6 transition-all duration-300 group-hover:scale-110">
                                                <Play className="w-12 h-12 text-black fill-black" />
                                            </div>
                                        </button>
                                    </div>

                                    {/* Content Overlay - Bottom Left */}
                                    <div className="absolute bottom-0 left-0 p-12 max-w-2xl">
                                        {/* Netflix Logo Style Title */}
                                        <div className="mb-6">
                                            <h1 className="text-2xl md:text-3xl font-bold text-white mb-4 drop-shadow-2xl">
                                                {details.title}
                                            </h1>
                                            {details.tagline && (
                                                <p className="text-lg text-white/90 italic mb-4">{details.tagline}</p>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        {/* <div className="flex items-center gap-3 mb-6">
                                            <button
                                                onClick={() => getYoutubeTrailer(
                                                    details.title,
                                                    mediaType,
                                                    details.release_date ? new Date(details.release_date).getFullYear().toString() : undefined
                                                )}
                                                className="bg-white hover:bg-white/90 text-black font-bold px-8 py-3 rounded-md flex items-center gap-2 transition-all text-lg"
                                            >
                                                <Play className="w-6 h-6 fill-black" /> Play
                                            </button>
                                            <button className="bg-gray-500/70 hover:bg-gray-500/90 text-white p-3 rounded-full transition-all">
                                                <Plus className="w-6 h-6" />
                                            </button>
                                            <button className="bg-gray-500/70 hover:bg-gray-500/90 text-white p-3 rounded-full transition-all">
                                                <ThumbsUp className="w-6 h-6" />
                                            </button>
                                        </div> */}
                                    </div>
                                </div>

                                {/* Details Section */}
                                <div className="px-12 py-8 bg-[#141414]">
                                    {/* Metadata Row */}
                                    <div className="flex items-center gap-4 text-sm text-gray-300 mb-6 flex-wrap">
                                        <span className="text-green-500 font-semibold">{(details.vote_average * 10).toFixed(0)}% Match</span>
                                        <span>{details.release_date ? new Date(details.release_date).getFullYear() : 'N/A'}</span>
                                        {details.runtime && (
                                            <span className="border border-gray-500 px-2 py-0.5 text-xs">
                                                {`${Math.floor(details.runtime / 60)}h ${details.runtime % 60}m`}
                                            </span>
                                        )}
                                    </div>

                                    {/* Description */}
                                    <p className="text-white text-sm mb-8 font-light leading-relaxed">
                                        {details.overview}
                                    </p>

                                    {/* Cast & Genres */}
                                    <div className="space-y-3 text-sm">
                                        {credits && credits.cast && credits.cast.length > 0 && (
                                            <div className="flex gap-2">
                                                <span className="text-gray-500 min-w-[80px]">Cast:</span>
                                                <span className="text-white">
                                                    {credits.cast.slice(0, 3).map(actor => actor.name).join(', ')}
                                                    {credits.cast.length > 3 && <span className="text-gray-400">, more</span>}
                                                </span>
                                            </div>
                                        )}
                                        {details.genres && details.genres.length > 0 && (
                                            <div className="flex gap-2">
                                                <span className="text-gray-500 min-w-[80px]">Genres:</span>
                                                <span className="text-white">{details.genres.map(genre => genre.name).join(', ')}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Streaming Providers Section */}
                                    {watchProviders && watchProviders.results.US && (
                                        <div className="mt-8 pt-8 border-t border-gray-800">
                                            <h2 className="text-white text-xl font-semibold mb-4">
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
                                                                    className="w-14 h-14 rounded-lg"
                                                                />
                                                                <span className="text-xs text-gray-400 text-center max-w-[80px]">
                                                                    {provider.provider_name}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-gray-400">
                                                        No streaming providers available
                                                    </p>
                                                )}
                                            </div>

                                            <p className="text-xs text-gray-600 mt-4">
                                                Streaming data provided by <a href="https://www.justwatch.com/" target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:underline">JustWatch</a>
                                            </p>
                                        </div>
                                    )}

                                    {/* Reviews Section */}
                                    <div className="mt-8 pt-8 border-t border-gray-800">
                                        <h2 className="text-white text-xl font-semibold mb-4">
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
                                                            className="p-2 rounded-lg bg-gray-800 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
                                                        >
                                                            <ChevronLeft className="w-5 h-5" />
                                                        </button>
                                                        <span className="text-gray-300">
                                                            Page {currentPage} of {reviews.total_pages}
                                                        </span>
                                                        <button
                                                            onClick={() => setCurrentPage(p => Math.min(reviews.total_pages, p + 1))}
                                                            disabled={currentPage === reviews.total_pages}
                                                            className="p-2 rounded-lg bg-gray-800 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
                                                        >
                                                            <ChevronRight className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Trailer Modal */}
                    {activeTrailer && (
                        <div className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4">
                            <div className="max-w-5xl w-full">
                                <button
                                    onClick={() => setActiveTrailer(null)}
                                    className="absolute top-4 right-4 text-white text-2xl hover:text-zinc-300 bg-black/50 w-12 h-12 flex items-center justify-center rounded-full transition-all hover:scale-110"
                                >
                                    ✕
                                </button>
                                <iframe
                                    src={`https://www.youtube.com/embed/${activeTrailer}?autoplay=1`}
                                    className="w-full aspect-video rounded-lg"
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
