import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { RootState } from '@/redux/store';
import MovieCard from '@/components/core/movieCard';
import Header from '@/components/core/Header';
import SEO from '@/components/SEO/SEO';
import PreviousPage from '@/components/ui/previousPage';
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
        <>
            <SEO
                title={pageTitle}
                description={pageDescription}
                url={`/search?q=${encodeURIComponent(query)}`}
                keywords={`${query}, movies, AI recommendations, film search, movie discovery`}
            />

            {/* Skip to main content link for keyboard users */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-amber-500 focus:text-black focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
                Skip to main content
            </a>

            <div className="min-h-screen bg-black text-white">
                <Header />

                <main id="main-content" className="mt-20 container mx-auto p-6">
                    <PreviousPage />

                    <div className="container mx-auto">
                        {query && (
                            <header className="mb-6">
                                <h1 className="text-base md:text-xl font-medium text-gray-200">
                                    Results for: "{query}"
                                </h1>
                            </header>
                        )}

                        {(loading || isStreaming ) && !error && movies.length === 0 && (
                            <section aria-label="Loading search results" role="status" aria-live="polite">
                                <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
                                    {Array.from({ length: 10 }).map((_, index) => (
                                        <div key={`skeleton-${index}`} className="animate-pulse">
                                            <div className="aspect-[2/3] bg-zinc-800 rounded-md" />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {error && (
                            <div
                                className="text-center py-20"
                                role="alert"
                                aria-live="assertive"
                            >
                                <p className="text-red-400">Error: {error}</p>
                            </div>
                        )}
                        {movies.length > 0 && (
                            <section aria-label={`Search results for ${query}`}>
                                <div
                                    className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3"
                                    role="list"
                                >
                                    {movies.map((movie, index) => {
                                        const isFullMovie = 'id' in movie && movie.id !== undefined;
                                        // Use stable key based on index to prevent React re-mounting during streaming
                                        const movieKey = `${query}-${index}`;

                                        return (
                                            <div key={movieKey} role="listitem">
                                                <MovieCard
                                                    movie={movie}
                                                    isHovered={isFullMovie && hoveredMovieId === movie.id}
                                                    onHover={isFullMovie ? () => setHoveredMovieId(movie.id) : undefined}
                                                    onLeave={isFullMovie ? () => setHoveredMovieId(null) : undefined}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
}