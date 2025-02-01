import React, { useState, useEffect } from 'react';
import { ArrowLeft, PlayCircle, Star, Clock, Film } from 'lucide-react';
import type { Movie } from '@/types/movie';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

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

const MoviePage: React.FC<MovieDetailsProps> = () => {
    const tmdbKey = import.meta.env.VITE_APP_TMDB_API_KEY;

    const navigate = useNavigate();

    const { state } = useLocation();
    const movie = state.movie;

    const goBack = () => {
        navigate(-1);
        // navigate('/specific-route')
    };

    const [imageError, setImageError] = useState(false);
    const [details, setDetails] = useState<MovieDetails | null>(null);
    const [activeTrailer, setActiveTrailer] = useState<string | null>(null);

    const getYoutubeTrailer = async(movieTitle:string) => {
        const response = await fetch(`https://youtube.googleapis.com/youtube/v3/search?channelType=any&maxResults=1&q=${movieTitle}trailer&key=AIzaSyAG4NH0PoFLV4W569T_iqQQFKaLr1shzYE`)
      const data = await response.json();
        setActiveTrailer(data.items[0].id.videoId)
    }

    const fetchMovieDetails = async (id:string|number) => {
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

    useEffect(() => {
        fetchMovieDetails(movie.id);
    }, [movie]);

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