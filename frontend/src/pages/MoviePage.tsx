import React, { useState, useEffect, useCallback } from 'react';
import { PlayCircle, Star, Clock, Film, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Movie, Review } from '@/types/movie';
import { useLocation } from 'react-router-dom';
import ReviewCard from "@/components/core/reviews"
import Header from '@/components/core/Header';
import PreviousPage from '@/components/ui/previousPage';
import APIService from "@/api/axios"
import SEO from '@/components/SEO/SEO';

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

const MoviePage: React.FC = () => {
    const { state } = useLocation();
    const movie = state.movie;

    const [imageError, setImageError] = useState(false);
    const [details, setDetails] = useState<MovieDetails | null>(null);
    const [activeTrailer, setActiveTrailer] = useState<string | null>(null);
    const [reviews, setReviews] = useState<ReviewsResponse | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoadingReviews, setIsLoadingReviews] = useState(false);
    const [watchProviders, setWatchProviders] = useState<WatchProvidersResponse | null>(null);

    const getYoutubeTrailer = async (title: string, mediaType?: string, releaseYear?: string) => {
        try {
            // Build more specific search query based on media type
            let searchQuery = title;

            // Add year to make search more specific
            if (releaseYear) {
                searchQuery += ` ${releaseYear}`;
            }

            // Add media type for better results
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
            throw error;
        }
    }

    const fetchMovieDetails = useCallback(async (id: string | number, mediaType?: string) => {
        try {
            const params = mediaType ? { media_type: mediaType } : {};
            const response = await APIService.getInstance('backend').get(`/movies/${id}`, { params });

            const details: MovieDetails = response.data;

            setDetails(details);
        } catch (error) {
            throw error;
        }
    }, []);

    const fetchReviews = useCallback(async () => {
        setIsLoadingReviews(true);
        try {
            const params = movie.media_type ? { media_type: movie.media_type } : {};
            const response = await APIService.getInstance('backend').get(`/movies/${movie.id}/reviews`, { params });
            setReviews(response.data);

        } catch (error) {
            console.error('Failed to fetch reviews', error);
            throw error;

        } finally {

            setIsLoadingReviews(false);
        }
    }, [movie.id, movie.media_type]);

    const fetchWatchProviders = useCallback(async () => {
        try {
            const params = movie.media_type ? { media_type: movie.media_type } : {};
            const response = await APIService.getInstance('backend').get(`/movies/${movie.id}/watch/providers`, { params });
            setWatchProviders(response.data);
        } catch (error) {
            console.error('Failed to fetch watch providers', error);
        }
    }, [movie.id, movie.media_type]);

    useEffect(() => {
        fetchMovieDetails(movie.id, movie.media_type);
        fetchWatchProviders();
    }, [movie, fetchMovieDetails, fetchWatchProviders]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews, currentPage]);

    // Generate structured data for the movie
    const movieStructuredData = details ? {
        "@context": "https://schema.org",
        "@type": "Movie",
        "name": details.title,
        "description": details.overview,
        "datePublished": details.release_date,
        "image": `http://image.tmdb.org/t/p/w500/${details.backdrop_path}`,
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": details.vote_average,
            "bestRating": "10",
            "worstRating": "6.5"
        },
        "genre": details.genres?.map(g => g.name).join(', '),
        "duration": `PT${details.runtime}M`
    } : null;

    return (
        <>
            {details && (
                <>
                    <SEO
                        title={`${details.title} (${new Date(details.release_date).getFullYear()})`}
                        description={details.overview || `Watch ${details.title} and discover similar movies on PromptFlix.`}
                        image={`http://image.tmdb.org/t/p/w500/${details.backdrop_path}`}
                        url={`/movies/${details.id}`}
                        type="video.movie"
                        keywords={`${details.title}, ${details.genres?.map(g => g.name).join(', ')}, watch movie, movie details`}
                        {...(movieStructuredData && { structuredData: movieStructuredData })}
                    />

                    {/* Skip to main content link for keyboard users */}
                    <a
                        href="#main-content"
                        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-purple-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    >
                        Skip to main content
                    </a>

                    <div className="fixed inset-0 z-50 bg-gray-900 overflow-y-auto">
                        <Header />

                        <main id="main-content" className="mt-20 container mx-auto p-6">
                  
                        <PreviousPage />

                        {/* Movie Hero Section */}
                        <article>
                            <section aria-label="Movie details" className="grid md:grid-cols-[400px_1fr] gap-8">
                                {/* Poster */}
                                <div>
                                    <img
                                        src={imageError ? `https://images.pexels.com/photos/29890776/pexels-photo-29890776/free-photo-of-traditional-vietnamese-new-year-gift-box.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2`
                                            : `http://image.tmdb.org/t/p/w500/${details.backdrop_path}`}
                                        className='rounded-md'
                                        alt={`${details.title} movie poster`}
                                        onError={() => setImageError(true)}
                                    />
                                </div>

                                {/* Movie Details */}
                                <div className="text-gray-100">
                                    <h1 className="text-lg 2xl:text-2xl font-bold mb-4">{details.title}</h1>

                                    {/* Quick Stats */}
                                    <div className="flex flex-wrap items-center text-sm xl:text-base gap-4 mb-4">
                                        <div className="flex items-center gap-2">
                                            <Star className="text-yellow-500" aria-hidden="true" />
                                            <span aria-label={`Rating: ${details.vote_average} out of 10`}>{details.vote_average}/10</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="text-red-500" aria-hidden="true" />
                                            <span aria-label={`Runtime: ${details.runtime} minutes`}>{details.runtime} mins</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Film className="text-cyan-500" aria-hidden="true" />
                                            <span aria-label="Genres">
                                                {details.genres?.map(genre => (
                                                    <span key={genre.id}>{genre.name}</span>
                                                )) || <span>No genres available</span>}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Overview */}
                                    <p className="text-sm xl:text-base text-gray-300 mb-6">{details.overview}</p>

                                    {/* Trailer Button */}
                                    <button
                                        onClick={() => getYoutubeTrailer(
                                            details.title,
                                            movie.media_type,
                                            details.release_date ? new Date(details.release_date).getFullYear().toString() : undefined
                                        )}
                                        aria-label={`Watch trailer for ${details.title}`}
                                        className="bg-amber-600 hover:bg-cyan-700 text-sm text-white px-6 py-3 rounded-lg flex items-center gap-2"
                                    >
                                        <PlayCircle aria-hidden="true" /> Watch Trailer
                                    </button>
                                </div>
                            </section>

                            {/* Streaming Providers Section */}
                            {watchProviders && watchProviders.results.US && (
                                <section aria-label="Where to stream" className="mt-12 m-auto">
                                    <h2 className="text-sm xl:text-base text-gray-200 mb-6">
                                        Where to Stream
                                    </h2>

                                    <div className="space-y-6">
                                        {/* Streaming Services */}
                                        {watchProviders.results.US.flatrate && watchProviders.results.US.flatrate.length > 0 ? (
                                            <div className="flex flex-wrap gap-4" role="list" aria-label="Available streaming services">
                                                {watchProviders.results.US.flatrate.map(provider => (
                                                    <div key={provider.provider_id} className="flex flex-col items-center gap-2" role="listitem">
                                                        <img
                                                            src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                                                            alt={`Available on ${provider.provider_name}`}
                                                            className="w-16 h-16 rounded-lg"
                                                        />
                                                        <span className="text-xs text-gray-400 text-center max-w-[80px]">
                                                            {provider.provider_name}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-s xl:text-sm text-gray-200 mb-6">
                                                No streaming providers available for this movie in your country (°__°)
                                            </p>
                                        )}
                                    </div>

                                    {/* JustWatch Attribution */}
                                    <p className="text-xs text-gray-500 mt-4">
                                        Streaming data provided by <a href="https://www.justwatch.com/" target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:underline">JustWatch</a>
                                    </p>
                                </section>
                            )}

                            {/* Reviews Section */}
                            <section aria-label="Movie reviews" className="mt-16 grid md:grid-cols-[1fr_400px]">
                                <div>
                                    <h2 className="text-lg xl:text-2xl text-gray-200 mb-6">
                                        Reviews {reviews && `(${reviews.total_results})`}
                                    </h2>

                                    {isLoadingReviews ? (
                                        <div
                                            className="text-center text-gray-400 py-8"
                                            role="status"
                                            aria-live="polite"
                                        >
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
                                                <nav
                                                    className="flex justify-center items-center gap-4 mt-8"
                                                    aria-label="Reviews pagination"
                                                    role="navigation"
                                                >
                                                    <button
                                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                        disabled={currentPage === 1}
                                                        aria-label="Go to previous page"
                                                        className="p-2 rounded-lg bg-gray-800 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <ChevronLeft className="w-5 h-5" aria-hidden="true" />
                                                    </button>
                                                    <span className="text-gray-300" aria-current="page">
                                                        Page {currentPage} of {reviews.total_pages}
                                                    </span>
                                                    <button
                                                        onClick={() => setCurrentPage(p => Math.min(reviews.total_pages, p + 1))}
                                                        disabled={currentPage === reviews.total_pages}
                                                        aria-label="Go to next page"
                                                        className="p-2 rounded-lg bg-gray-800 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <ChevronRight className="w-5 h-5" aria-hidden="true" />
                                                    </button>
                                                </nav>
                                            )}
                                        </>
                                    )}
                                </div>
                            </section>

                            {/* Trailer Modal */}
                            {activeTrailer && (
                                <div
                                    className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                                    role="dialog"
                                    aria-modal="true"
                                    aria-label="Movie trailer video"
                                >
                                    <div className="max-w-4xl w-full">
                                        <button
                                            onClick={() => setActiveTrailer(null)}
                                            aria-label="Close trailer"
                                            className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 rounded"
                                        >
                                            ✕
                                        </button>
                                        <iframe
                                            src={`https://www.youtube.com/embed/${activeTrailer}`}
                                            className="w-full aspect-video"
                                            title={`${details.title} - Official Trailer`}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    </div>
                                </div>
                            )}
                        </article>
                        </main>
                    </div>
                </>
            )}
        </>
    );
};

export default MoviePage;