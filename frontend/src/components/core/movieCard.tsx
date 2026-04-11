import { Card, CardContent } from '@/components/ui/card';
import type { Movie } from '@/types/movie';
import { Link, useLocation } from 'react-router-dom'
import { Star } from 'lucide-react';
import { trackMovieClick } from '@/utils/tracking';

interface PartialMovie {
    title: string;
    year: number;
    isLoading?: boolean;
}

interface MovieCardProps {
    movie: Movie | PartialMovie;
    onSelect?: (movie: Movie) => void;
    isHovered?: boolean;
    onHover?: () => void;
    onLeave?: () => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, isHovered, onHover, onLeave }) => {
    const location = useLocation();

    // Check if movie is fully loaded
    const isFullMovie = (m: Movie | PartialMovie): m is Movie => {
        return 'id' in m && m.id !== undefined;
    };

    const isLoading = !isFullMovie(movie);
    const fullMovie = isFullMovie(movie) ? movie : null;

    // Track click when user clicks on movie
    const handleClick = () => {
        if (fullMovie) {
            // Ensure id is a number (TMDB IDs are always numbers)
            const movieId = typeof fullMovie.id === 'string' ? parseInt(fullMovie.id, 10) : fullMovie.id;
            trackMovieClick(movieId, fullMovie.title);
        }
    };

    const cardContent = (
        <div
            className={`relative group ${isLoading ? 'cursor-default' : 'cursor-pointer'} transition-all duration-300 ease-out overflow-hidden rounded`}
            onMouseEnter={isLoading ? undefined : onHover}
            onMouseLeave={isLoading ? undefined : onLeave}
        >

            <Card className={`rounded-md overflow-hidden bg-gray-900 border-gray-700 transition-all duration-300 ${!isLoading && isHovered ? 'scale-105 z-50 shadow-2xl' : 'hover:scale-102'}`}>
                <CardContent className="p-0 relative">
                    <div className="aspect-[2/3] relative overflow-hidden bg-gray-800">
                        {isLoading ? (
                            // Loading state with shimmer
                            <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-shimmer"
                                 style={{
                                     backgroundSize: '200% 100%',
                                     animation: 'shimmer 1.5s infinite'
                                 }}
                            />
                        ) : (
                            // Loaded state with image
                            <>
                                <img
                                    src={`http://image.tmdb.org/t/p/w500/${fullMovie!.poster_path}`}
                                    alt={fullMovie!.title}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                        e.currentTarget.src = `https://via.placeholder.com/300x450/1a1a1a/white?text=${encodeURIComponent(fullMovie!.title)}`;
                                    }}
                                />

                                {/* Overlay that appears on hover - only when loaded */}
                                <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                                    <div className="absolute bottom-0 left-0 right-0 p-4">
                                        <h3 className="text-white/90 font-bold text-sm mb-1 line-clamp-2">
                                            {fullMovie!.title}
                                        </h3>

                                        <div className="flex gap-2 mb-2 text-xs text-gray-300">
                                            <div className="flex items-center gap-1">
                                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                <span>{fullMovie!.vote_average.toFixed(1)}</span>
                                            </div>
                                            <span>•</span>
                                            <span>{new Date(fullMovie!.release_date).getFullYear()}</span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Title and year below card */}
            {/* <div className="mt-2 px-1">
                <h3 className="text-white font-semibold text-sm line-clamp-1">
                    {movie.title}
                </h3>
                <p className="text-gray-400 text-xs mt-0.5">
                    {'year' in movie ? movie.year : new Date(fullMovie!.release_date).getFullYear()}
                </p>
            </div> */}
        </div>
    );

    // Wrap with Link only if fully loaded
    return (
        <>
            {isLoading ? cardContent : (
                <Link
                    to={`/movies/${fullMovie!.id}`}
                    state={{ backgroundLocation: location, movie: fullMovie }}
                    onClick={handleClick}
                >
                    {cardContent}
                </Link>
            )}

            {/* CSS for shimmer animation */}
            <style>{`
                @keyframes shimmer {
                    0% {
                        background-position: -200% 0;
                    }
                    100% {
                        background-position: 200% 0;
                    }
                }
                .animate-shimmer {
                    animation: shimmer 1.5s infinite;
                }
            `}</style>
        </>
    );
};

export default MovieCard 