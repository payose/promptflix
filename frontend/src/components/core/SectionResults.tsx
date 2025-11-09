import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from '@/components/core/movieCard';
import MovieCardSkeleton from '@/components/core/MovieCardSkeleton';
import { RootState } from '@/redux/store';
import type { Movie } from '@/types/movie';
import { useMovieStreaming } from '@/hooks/useMovieStreaming';

const sectionQueries = [
    'mind-bending sci-fi movies that make you cringe',
    'Movies based on novel adaptations',
    'movies from parallel universes without any superheroes',
    'movies that make you ponder on the meaning of life',
];


interface MovieSectionProps {
    query: string;
    movies: (Movie | { title: string; year: number; isLoading?: boolean })[];
}

const MovieSection = ({ query, movies }: MovieSectionProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [hoveredMovie, setHoveredMovie] = useState<number | null>(null);
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

    const isFullMovie = (movie: any): movie is Movie => {
        return 'id' in movie && movie.id !== undefined;
    };

    return (
        <div className="relative group mb-12">
            {/* Section Header */}
            <div className="px-4 md:px-8">
                <h2 className="text-base md:text-xl font-medium text-white/85 pb-4">
                    {query}
                </h2>

                {/* Movies Row */}
                <div className="relative">
                    {/* Left Arrow */}
                    {showLeftArrow && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => scroll('left')}
                            className="absolute left-2 top-1/2 -translate-y-1/2 z-40 rounded-full bg-black/50 text-white hover:bg-black/80 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-12 w-12"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </Button>
                    )}

                    {/* Right Arrow */}
                    {showRightArrow && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => scroll('right')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 z-40 rounded-full bg-black/50 text-white hover:bg-black/90 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-12 w-12"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </Button>
                    )}

                    {/* Movies Container */}
                    <div
                        ref={scrollRef}
                        onScroll={handleScroll}
                        className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
                        style={{
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none'
                        } as React.CSSProperties}
                    >
                        {movies.map((movie, index) => (
                            <div key={isFullMovie(movie) ? movie.id : `${movie.title}-${index}`} className="flex-none w-28 md:w-52">
                                {isFullMovie(movie) ? (
                                    <MovieCard
                                        movie={movie}
                                        isHovered={hoveredMovie === movie.id}
                                        onHover={() => setHoveredMovie(movie.id)}
                                        onLeave={() => setHoveredMovie(null)}
                                    />
                                ) : (
                                    <MovieCardSkeleton
                                        title={movie.title}
                                        year={movie.year}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function SectionResults() {
    const { partialSections, sectionLoading } = useSelector((state: RootState) => state.movies);
    const { streamMovies } = useMovieStreaming({ type: 'section' });

    useEffect(() => {
        const fetchSectionMovies = async () => {
            for (const query of sectionQueries) {
                // Only fetch if we don't have cached results
                if (!partialSections[query]) {
                    await streamMovies(query);
                }
            }
        };

        fetchSectionMovies();
    }, [partialSections, streamMovies]);

    return (
        <div className="mt-6 min-h-screen">
            {sectionLoading && Object.keys(partialSections).length === 0 ? (
                <div className="flex items-center justify-center py-20">
                    <div className="text-gray-400">Loading sections...</div>
                </div>
            ) : (
                sectionQueries.map((query, index) => (
                    <MovieSection
                        key={index}
                        query={query}
                        movies={partialSections[query] || []}
                    />
                ))
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