// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { Stars } from 'lucide-react';
import type { Movie } from '@/types/movie';
import { Link } from 'react-router-dom'

interface MovieCardProps {
    movie: Movie;
    onSelect?: (movie: Movie) => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
    const moviePageProp = {
        movie: movie,
    };

    const [imageError, setImageError] = useState(false);

    return (
        <Link to={`/movies/${movie.id}`} state = { moviePageProp }>
            <div className="bg-transparent border-none">
                <div className="relative aspect-[2/3] overflow-hidden h-[20rem] rounded-md">
                    <img
                        src={imageError ? `https://images.pexels.com/photos/29890776/pexels-photo-29890776/free-photo-of-traditional-vietnamese-new-year-gift-box.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2` 
                                        : `http://image.tmdb.org/t/p/w500/${movie.poster_path}`}
                        alt={`poster of ${movie.title}`}
                        onError={() => setImageError(true)}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className='pt-2 pl-1'>
                    <h3 className="text-gray-100">{movie.title}</h3>
                    <p className="text-gray-400 text-xs pt-1">
                        {new Date(movie.release_date).getFullYear()}
                        {/* {movie.release_date} | {movie.genres.join(', ')} */}
                    </p>
                    <div className="flex items-center gap-1 pt-1">
                        <Stars className="h-4 w-4 text-yellow-500" />
                        <span className='text-gray-400 text-xs'>{movie.vote_average.toFixed(1)}/10</span>
                    </div>
                </div>
                   
            </div>
        </Link>
    );
};


export default MovieCard 