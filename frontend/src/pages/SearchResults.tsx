import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { queryMovies } from '@/redux/movieSlice';
import { RootState, AppDispatch } from '@/redux/store';
import MovieCard from '@/components/core/movieCard';
import SearchBox from '@/components/core/SearchBox';
import Header from '@/components/core/Header';
import { Loader2 } from 'lucide-react';

export default function SearchResultsPage() {
    const location = useLocation();
    const dispatch = useDispatch<AppDispatch>();
    const { searchResults, loading, error } = useSelector((state: RootState) => state.movies);
    const [hoveredMovieId, setHoveredMovieId] = useState<string | number | null>(null);
    
    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get('q') || '';

    useEffect(() => {
        if (query && !searchResults[query]) {
            dispatch(queryMovies(query));
        }
    }, [query, dispatch, searchResults]);

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
                
                {loading && (
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
                
                {!loading && !error && (!searchResults[query] || searchResults[query].length === 0) && query && (
                    <div className="text-center py-20">
                        <p className="text-gray-400">No movies found for your search.</p>
                    </div>
                )}
                
                {!loading && searchResults[query] && searchResults[query].length > 0 && (
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                        {searchResults[query].map((movie) => (
                            <MovieCard
                                key={movie.id}
                                movie={movie}
                                isHovered={hoveredMovieId === movie.id}
                                onHover={() => setHoveredMovieId(movie.id)}
                                onLeave={() => setHoveredMovieId(null)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}