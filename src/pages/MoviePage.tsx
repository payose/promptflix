import React, { useState, useEffect } from 'react';
import { ArrowLeft, PlayCircle, Star, Clock, Film, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Movie, Review } from '@/types/movie';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import ReviewCard from "@/components/core/reviews"

interface MovieDetailsProps {
    movie: Movie;
}

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

const MoviePage: React.FC<MovieDetailsProps> = () => {
    const tmdbKey = import.meta.env.VITE_APP_TMDB_API_KEY;

    const navigate = useNavigate();
    const { state } = useLocation();
    const movie = state.movie;

    const [imageError, setImageError] = useState(false);
    const [details, setDetails] = useState<MovieDetails | null>(null);
    const [activeTrailer, setActiveTrailer] = useState<string | null>(null);
    const [reviews, setReviews] = useState<ReviewsResponse | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoadingReviews, setIsLoadingReviews] = useState(false);

    const goBack = () => {
        navigate(-1);
        // navigate('/specific-route')
    };

    const getYoutubeTrailer = async (movieTitle: string) => {
        const response = await fetch(`https://youtube.googleapis.com/youtube/v3/search?channelType=any&maxResults=1&q=${movieTitle}trailer&key=AIzaSyAG4NH0PoFLV4W569T_iqQQFKaLr1shzYE`)
        const data = await response.json();
        setActiveTrailer(data.items[0].id.videoId)
    }

    const fetchMovieDetails = async (id: string | number) => {
        const tmdbResponse = await fetch(
            `https://api.themoviedb.org/3/movie/${id}?api_key=${tmdbKey}`,
            { headers: { accept: 'application/json' } }
        );
        const movieResult = await tmdbResponse.json();

        if (movieResult && movieResult) {
            const tmdbMovie = movieResult;

            const details: MovieDetails = {
                id: tmdbMovie.id,
                title: tmdbMovie.title,
                release_date: tmdbMovie.release_date,
                overview: tmdbMovie.overview,
                poster_path: tmdbMovie.poster_path,
                backdrop_path: tmdbMovie.backdrop_path,
                video: tmdbMovie.video,
                vote_average: tmdbMovie.vote_average,
                vote_count: tmdbMovie.vote_count,
                original_language: tmdbMovie.original_language,
                genres: tmdbMovie.genres,
                belongs_to_collection: tmdbMovie.belongs_to_collection,
                runtime: tmdbMovie.runtime,
                tagline: tmdbMovie.tagline
            };

            setDetails(details);
        }
    };

    const fetchReviews = async () => {
            setIsLoadingReviews(true);
            try {
                const response = await fetch(
                    `https://api.themoviedb.org/3/movie/${movie.id}/reviews?api_key=${tmdbKey}&page=${currentPage}`
                );
                
                if (!response.ok) {
                    throw new Error('Failed to fetch reviews');
                }
                
                const data: ReviewsResponse = await response.json();
                setReviews(data);
            } catch (error) {
                console.error('Error fetching reviews:', error);
            } finally {
                setIsLoadingReviews(false);
            }
    };

    useEffect(() => {
        fetchMovieDetails(movie.id);
    }, [movie]);

    useEffect(() => {
        fetchReviews();
    }, [movie.id, currentPage]);

    return (
        <div className="fixed inset-0 z-50 bg-gray-900 overflow-y-auto">
            {details && (
                <div className="container mx-auto p-6">
                    {/* Header with Back Button */}
                    <button
                        onClick={goBack}
                        className="flex items-center gap-2 text-gray-300 hover:text-white mb-6"
                    >
                        <ArrowLeft /> Back to Search
                    </button>

                    {/* Movie Hero Section */}
                    <div className="grid md:grid-cols-[400px_1fr] gap-8">
                        {/* Poster */}
                        <div>
                            <img
                                src={imageError ? `https://images.pexels.com/photos/29890776/pexels-photo-29890776/free-photo-of-traditional-vietnamese-new-year-gift-box.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2`
                                    : `http://image.tmdb.org/t/p/w500/${details.backdrop_path}`}
                                className='rounded-md'
                                alt={`poster of ${details.title}`}
                                onError={() => setImageError(true)}
                            />
                        </div>

                        {/* Movie Details */}
                        <div className="text-gray-100">
                            <h1 className="text-4xl font-bold mb-4">{details.title}</h1>

                            {/* Quick Stats */}
                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex items-center gap-2">
                                    <Star className="text-yellow-500" />
                                    <span>{details.vote_average}/10</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="text-blue-400" />
                                    <span>{details.runtime} mins</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Film className="text-green-400" />
                                    {details.genres.map(genre => (
                                        <span key={genre.id}>{genre.name}</span>
                                    ))}
                                </div>
                            </div>

                            {/* Overview */}
                            <p className="text-gray-300 mb-6">{details.overview}</p>

                            {/* Trailer Button */}
                            <button
                                onClick={() => getYoutubeTrailer(details.title)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2"
                            >
                                <PlayCircle /> Watch Trailer
                            </button>
                        </div>
                    </div>

                    {/* Reviews Section */}
                    <div className="mt-16 grid md:grid-cols-[1fr_400px]">
                        <div>
                            <h2 className="text-2xl text-gray-200 mb-6">
                                Reviews {reviews && `(${reviews.total_results})`}
                            </h2>

                            {isLoadingReviews ? (
                                <div className="text-center text-gray-400 py-8">Loading reviews...</div>
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

                    {/* Trailer Modal */}
                    {activeTrailer && (
                        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                            <div className="max-w-4xl w-full">
                                <button
                                    onClick={() => setActiveTrailer(null)}
                                    className="absolute top-4 right-4 text-white text-2xl"
                                >
                                    ✕
                                </button>
                                <iframe
                                    src={`https://www.youtube.com/embed/${activeTrailer}`}
                                    className="w-full aspect-video"
                                    title="Movie Trailer"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MoviePage;