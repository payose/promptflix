import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Stars, ThumbsUp } from 'lucide-react';
import type { Movie } from '@/types/movie';

interface MovieCardProps {
    movie: Movie;
    onSelect?: (movie: Movie) => void;
    className?: string;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onSelect, className = ''}) => {
    return (
      <Card 
        className={`bg-gray-800/50 border-gray-700 overflow-hidden group hover:border-blue-500 transition-all ${className}`}
        onClick={() => onSelect?.(movie)}
      >
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={movie.posterPath}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <CardHeader>
          <CardTitle className="text-gray-100">{movie.title}</CardTitle>
          <CardDescription className="text-gray-400">
            {movie.release_date} | {movie.genres.join(', ')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300 text-sm line-clamp-2">{movie.overview}</p>
        </CardContent>
        <CardFooter className="flex justify-between text-gray-400">
          <div className="flex items-center gap-2">
            <Stars className="h-4 w-4 text-yellow-500" />
            <span>{movie.vote_average}/10</span>
          </div>
          <div className="flex items-center gap-2">
            <ThumbsUp className="h-4 w-4" />
            <span>Recommended</span>
          </div>
        </CardFooter>
      </Card>
    );
  };


  export default MovieCard 