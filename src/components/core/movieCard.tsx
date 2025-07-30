import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';
import type { Movie } from '@/types/movie';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom'
import { Star, Play, Plus } from 'lucide-react';

interface MovieCardProps {
    movie: Movie;
    onSelect?: (movie: Movie) => void;
    isHovered?: boolean;
    onHover?: () => void;
    onLeave?: () => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, isHovered, onHover, onLeave }) => {
    const moviePageProp = {
        movie: movie,
    };

    return (
        <div
            className="relative group cursor-pointer transition-all duration-300 ease-out overflow-hidden rounded-lg"
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
        >
            <Link to={`/movies/${movie.id}`} state={moviePageProp}>

                <Card className={`overflow-hidden bg-gray-900 border-gray-700 transition-all duration-300 ${isHovered ? 'scale-105 z-50 shadow-2xl' : 'hover:scale-102'
                    }`}>
                    <CardContent className="p-0 relative">
                        <div className="aspect-[2/3] relative overflow-hidden">

                            <img
                                src={`http://image.tmdb.org/t/p/w500/${movie.poster_path}`}
                                alt={movie.title}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                onError={(e) => {
                                    e.target.src = `https://via.placeholder.com/300x450/1a1a1a/white?text=${encodeURIComponent(movie.title)}`;
                                }}
                            />

                            {/* Overlay that appears on hover */}
                            <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'
                                }`}>
                                <div className="absolute bottom-0 left-0 right-0 p-4">
                                    <h3 className="text-left text-white/90 font-bold text-sm mb-1 line-clamp-2">
                                        {movie.title}
                                    </h3>

                                    <div className="flex gap-2 mb-2 text-xs text-gray-300">
                                        <div className="flex items-center gap-1">
                                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                            <span>{movie.rating}</span>
                                        </div>
                                        <span>•</span>
                                        <span>{new Date(movie.release_date).getFullYear()}</span>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button role='button' size="sm" className="h-8 px-3 bg-white text-black hover:bg-gray-200">
                                            <Play className="w-3 h-3 mr-1" />
                                            Play
                                        </Button>
                                        <Button role='button' size="sm" variant="outline" className="h-8 w-8 p-0 border-gray-600 hover:border-white">
                                            <Plus className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </Link>
        </div>
    );
};

export default MovieCard 