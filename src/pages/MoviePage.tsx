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
    cast: Array<{
        id: number;
        name: string;
        character: string;
        profile_path?: string;
    }>;
}

const MoviePage: React.FC<MovieDetailsProps> = () => {
    const navigate = useNavigate();

    const { state } = useLocation();
    const movie = state.movie;

    const goBack = () => {
        navigate(-1);
        // navigate('/specific-route')
    };

    const [details, setDetails] = useState<MovieDetails | null>(null);
    const [activeTrailer, setActiveTrailer] = useState<string | null>(null);

    const getYoutubeTrailer = async(movieTitle:string) => {
        const response = await fetch(`https://youtube.googleapis.com/youtube/v3/search?channelType=any&maxResults=1&q=${movieTitle}trailer&key=AIzaSyAG4NH0PoFLV4W569T_iqQQFKaLr1shzYE`)
      const data = await response.json();
        setActiveTrailer(data.items[0].id.videoId)
    }

    useEffect(() => {
        // Mock API call - replace with actual TMDB API fetch
        const fetchMovieDetails = async () => {
            const mockDetails: MovieDetails = {
                ...movie,
                runtime: 148,
                trailer_key: 'dQw4w9WgXcQ', // YouTube trailer key
                cast: [
                    {
                        id: 1,
                        name: 'Leonardo DiCaprio',
                        character: 'Main Character',
                        profile_path: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=800'
                    },
                    {
                        id: 2,
                        name: 'Joseph Gordon-Levitt',
                        character: 'Supporting Role',
                        profile_path: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=800'
                    }
                ]
            };
            setDetails(mockDetails);
        };

        fetchMovieDetails();
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
                    <div className="grid md:grid-cols-[300px_1fr] gap-8">
                        {/* Poster */}
                        <div>
                            <img
                                src={details.posterPath}
                                alt={details.title}
                                className="w-full rounded-lg shadow-2xl"
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
                                    <span>{details.genres?.join(', ')}</span>
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

                    {/* Cast Section */}
                    <div className="mt-12">
                        <h2 className="text-2xl text-gray-200 mb-6">Cast</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {details.cast.map(actor => (
                                <div
                                    key={actor.id}
                                    className="bg-gray-800 rounded-lg p-4 text-center"
                                >
                                    <img
                                        src={actor.profile_path}
                                        alt={actor.name}
                                        className="w-24 h-24 mx-auto rounded-full object-cover mb-2"
                                    />
                                    <p className="text-gray-200">{actor.name}</p>
                                    <p className="text-gray-500 text-sm">{actor.character}</p>
                                </div>
                            ))}
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