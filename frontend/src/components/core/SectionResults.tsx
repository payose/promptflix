import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from '@/components/core/movieCard';
import { RootState } from '@/redux/store';
import { useMovieStreaming } from '@/hooks/useMovieStreaming';

const sectionQueries = [
    'mind-bending sci-fi movies that make you cringe',
    'Movies based on novel adaptations',
    'movies from parallel universes without any superheroes',
    'movies that make you ponder on the meaning of life',
];


interface MovieSectionProps {
    query: string;
    movies: any[];
}

const MovieSection = ({ query, movies }: MovieSectionProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [hoveredMovie, setHoveredMovie] = useState<number | string | null>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = scrollRef.current.clientWidth * 0.8;
            const newScrollLeft = scrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);

            scrollRef.current.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });
        }
    };

    const handleScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setShowLeftArrow(scrollLeft > 0);
            setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    if (!movies || movies.length === 0) {
        return null;
    }

    return (
        <div className="relative group mb-16">
            {/* Section Header */}
            <div className="px-4 md:px-8">
                <div className="mb-6">
                {/* <h2 className="text-base md:text-xl font-medium text-white/85 pb-4"> */}
                    <h2 className="text-lg md:text-2xl font-semibold text-transparent bg-clip-text bg-purple-300 pb-1 inline-block">
                        {query}
                    </h2>
                    <div className="h-0.5 w-20 bg-pink-500 mt-2 rounded-full"></div>
                </div>

                {/* Movies Row */}
                <div className="relative">
                    {/* Left Arrow */}
                    {showLeftArrow && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => scroll('left')}
                            className="absolute -left-4 md:left-0 top-1/2 -translate-y-1/2 z-40 rounded-full bg-amber-500/90 text-white hover:bg-amber-600 hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-300 h-10 w-10 md:h-12 md:w-12 shadow-lg shadow-amber-500/30"
                        >
                            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                        </Button>
                    )}

                    {/* Right Arrow */}
                    {showRightArrow && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => scroll('right')}
                            className="absolute -right-4 md:right-0 top-1/2 -translate-y-1/2 z-40 rounded-full bg-amber-500/90 text-white hover:bg-amber-600 hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-300 h-10 w-10 md:h-12 md:w-12 shadow-lg shadow-amber-500/30"
                        >
                            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                        </Button>
                    )}

                    {/* Movies Container */}
                    <div
                        ref={scrollRef}
                        onScroll={handleScroll}
                        className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide pb-4"
                        style={{
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none'
                        } as React.CSSProperties}
                    >
                        {movies.map((movie, index) => {
                            const isFullMovie = 'id' in movie && movie.id !== undefined;
                            const movieId = isFullMovie ? movie.id : `${movie.title}-${index}`;

                            return (
                                <div key={movieId} className="flex-none w-32 md:w-52">
                                    <MovieCard
                                        movie={movie}
                                        isHovered={isFullMovie && hoveredMovie === movie.id}
                                        onHover={isFullMovie ? () => setHoveredMovie(movie.id) : undefined}
                                        onLeave={isFullMovie ? () => setHoveredMovie(null) : undefined}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function SectionResults() {
    const { partialSections, sectionLoading } = useSelector((state: RootState) => state.movies);
    const { streamMovies } = useMovieStreaming({ type: 'section' });
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        const fetchSectionMovies = async () => {
            for (const query of sectionQueries) {
                // Only fetch if we don't have cached results
                if (!partialSections[query]) {
                    await streamMovies(query);
                }
            }
            // Once all queries are done or cached, stop initial loading
            setInitialLoading(false);
        };

        fetchSectionMovies();
    }, [partialSections, streamMovies]);

    return (
        <div className="mt-8 mb-10 xl:mb-30 min-h-screen">
            {(sectionLoading || initialLoading) && Object.keys(partialSections).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32">
                    {/* Animated loading spinner with gradient */}
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-gray-700 rounded-full"></div>
                        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-pink-500 border-r-purple-500 rounded-full animate-spin"></div>
                    </div>
                    <div className="mt-6 text-center">
                        <p className="text-lg font-medium text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                            Finding the perfect movies for you
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                            Curating personalized recommendations...
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {sectionQueries.map((query, index) => (
                        <MovieSection
                            key={index}
                            query={query}
                            movies={partialSections[query] || []}
                        />
                    ))}
                </div>
            )}

            {/* CSS to hide scrollbars */}
            <style>{`
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
}