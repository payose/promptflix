import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { RootState } from '@/redux/store';
import MovieCard from '@/components/core/movieCard';
import MovieCardSkeleton from '@/components/core/MovieCardSkeleton';
import SearchBox from '@/components/core/SearchBox';
import Header from '@/components/core/Header';
import { Loader2 } from 'lucide-react';
import { useMovieStreaming } from '@/hooks/useMovieStreaming';
import type { Movie } from '@/types/movie';

export default function SearchResultsPage() {
    const location = useLocation();
    const { partialSearches, loading, error } = useSelector((state: RootState) => state.movies);
    const [hoveredMovieId, setHoveredMovieId] = useState<string | number | null>(null);
    const { streamMovies } = useMovieStreaming({ type: 'search' });

    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get('q') || '';

    useEffect(() => {
        if (query && !partialSearches[query]) {
            streamMovies(query);
        }
    }, [query, partialSearches, streamMovies]);

    const movies = partialSearches[query] || [];
    const isFullMovie = (movie: any): movie is Movie => {
        return 'id' in movie && movie.id !== undefined;
    };

    return (
        <div className="min-h-screen bg-black text-white">
            <Header />

            <div className="container mx-auto px-4 py-8">
                <div className="mb-8 mx-32">
                    <SearchBox />
                </div>

                {query && (
                    <div className="mb-6">
                        <h1 className="text-base md:text-xl font-medium text-gray-200">
                            Results for: "{query}"
                        </h1>
                    </div>
                )}

                {loading && movies.length === 0 && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 text-pink-500 animate-spin" />
                        <span className="ml-2 text-gray-400">Finding movies for you...</span>
                    </div>
                )}

                {error && (
                    <div className="text-center py-20">
                        <p className="text-red-400">Error: {error}</p>
                    </div>
                )}

                {!loading && movies.length === 0 && query && (
                    <div className="text-center py-20">
                        <p className="text-gray-400">No movies found for your search.</p>
                    </div>
                )}

                {movies.length > 0 && (
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                        {movies.map((movie, index) => (
                            // <div key={isFullMovie(movie) ? movie.id : `${movie.title}-${index}`}>
                            //     {isFullMovie(movie) ? (
                            //         <MovieCard
                            //             movie={movie}
                            //             isHovered={hoveredMovieId === movie.id}
                            //             onHover={() => setHoveredMovieId(movie.id)}
                            //             onLeave={() => setHoveredMovieId(null)}
                            //         />
                            //     ) : (
                                    <MovieCardSkeleton
                                        title={movie.title}
                                        year={movie.year}
                                    />
                                // )}
                            // </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}