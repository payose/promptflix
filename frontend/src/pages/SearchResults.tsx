import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { RootState } from '@/redux/store';
import MovieCard from '@/components/core/movieCard';
import Header from '@/components/core/Header';
import SEO from '@/components/SEO/SEO';
import PreviousPage from '@/components/ui/previousPage';
import { Loader2 } from 'lucide-react';
import { useMovieStreaming } from '@/hooks/useMovieStreaming';

export default function SearchResultsPage() {
    const location = useLocation();
    const { partialSearches, loading, error } = useSelector((state: RootState) => state.movies);
    const [hoveredMovieId, setHoveredMovieId] = useState<string | number | null>(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const { streamMovies } = useMovieStreaming({ type: 'search' });

    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get('q') || '';
    const filter = searchParams.get('filter') || undefined;
    const movies = partialSearches[query] || [];

    // Generate SEO metadata
    const pageTitle = query
        ? `${query} - Movie Search Results`
        : 'Search Movies';
    const pageDescription = query
        ? `Discover ${query} with AI-powered movie recommendations. Browse through personalized movie suggestions and find your next favorite film.`
        : 'Search for movies using natural language and get AI-powered recommendations instantly.';

    useEffect(() => {
        if (query && !partialSearches[query]) {
            setIsStreaming(true);
            streamMovies(query, filter);
        }
    }, [query, filter, partialSearches, streamMovies]);

    // Stop showing streaming indicator once we have movies
    useEffect(() => {
        if (partialSearches[query] && partialSearches[query].length > 0) {
            setIsStreaming(false);
        }
    }, [partialSearches, query]);

    return (
        <div className="min-h-screen bg-black text-white">
            <SEO
                title={pageTitle}
                description={pageDescription}
                url={`/search?q=${encodeURIComponent(query)}`}
                keywords={`${query}, movies, AI recommendations, film search, movie discovery`}
            />
            <Header />
            
            <div className="mt-20 container mx-auto p-6">
                <PreviousPage />

                <div className="container mx-auto">

                    {query && (
                        <div className="mb-6">
                            <h1 className="text-base md:text-xl font-medium text-gray-200">
                                Results for: "{query}"
                            </h1>
                        </div>
                    )}

                    {(loading || isStreaming) && movies.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="h-12 w-12 text-pink-500 animate-spin mb-4" />
                            <span className="text-gray-400">Finding movies for you...</span>
                        </div>
                    )}

                    {error && (
                        <div className="text-center py-20">
                            <p className="text-red-400">Error: {error}</p>
                        </div>
                    )}

                    {!loading && !isStreaming && movies.length === 0 && query && (
                        <div className="text-center py-20">
                            <p className="text-gray-400">No movies found for your search.</p>
                        </div>
                    )}

                    {movies.length > 0 && (
                        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
                            {movies.map((movie, index) => {
                                const isFullMovie = 'id' in movie && movie.id !== undefined;
                                const movieId = isFullMovie ? movie.id : `${movie.title}-${index}`;

                                return (
                                    <MovieCard
                                        key={movieId}
                                        movie={movie}
                                        isHovered={isFullMovie && hoveredMovieId === movie.id}
                                        onHover={isFullMovie ? () => setHoveredMovieId(movie.id) : undefined}
                                        onLeave={isFullMovie ? () => setHoveredMovieId(null) : undefined}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}