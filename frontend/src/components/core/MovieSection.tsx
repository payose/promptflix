import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from '@/components/core/movieCard';

interface MovieSectionProps {
    query: string;
    movies: any[];
}

export default function MovieSection({ query, movies }: MovieSectionProps) {
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
        <div className="relative group mb-16 lg:pl-10">
            {/* Section Header */}
            <div className="px-4 md:px-8">
                <div className="mb-3">
                    <h2 className="text-lg md:text-xl font-medium text-transparent bg-clip-text bg-gray-300 inline-block">
                        {query}
                    </h2>
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
                            // Use stable key based on index to prevent React re-mounting during streaming
                            const movieKey = `${query}-${index}`;

                            return (
                                <div key={movieKey} className="flex-none w-32 md:w-44">
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
}
