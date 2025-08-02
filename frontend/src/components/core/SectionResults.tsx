import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from '@/components/core/movieCard';
import { sectionQuery } from '@/redux/movieSlice';
import { RootState, AppDispatch } from '@/redux/store';

const sectionQueries = [
    'mind-bending sci-fi movies that make you cringe',
    'Movies based on novel adaptations',
    'movies from parallel universes without any superheroes',
    'movies that make you think about the meaning of life',
];


const MovieSection = ({ query, movies }) => {
    const scrollRef = useRef(null);
    const [hoveredMovie, setHoveredMovie] = useState(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);

    const scroll = (direction) => {
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
        <div className="relative group mb-12">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-4 px-4 md:px-8">
                <h2 className="text-xl md:text-2xl font-bold text-white/85">
                    {query}
                </h2>
            </div>

            {/* Movies Row */}
            <div className="relative px-4 md:px-8">
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
                        msOverflowStyle: 'none',
                        WebkitScrollbar: { display: 'none' }
                    }}
                >
                    {movies.map((movie) => (
                        <div key={movie.id} className="flex-none w-48 md:w-52">
                            <MovieCard
                                movie={movie}
                                isHovered={hoveredMovie === movie.id}
                                onHover={() => setHoveredMovie(movie.id)}
                                onLeave={() => setHoveredMovie(null)}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default function SectionResults() {
    const dispatch = useDispatch<AppDispatch>();
    const { sectionResults, sectionLoading } = useSelector((state: RootState) => state.movies);

    useEffect(() => {
        const fetchSectionMovies = async () => {
            for (const query of sectionQueries) {
                // Only fetch if we don't have cached results
                if (!sectionResults[query]) {
                    await dispatch(sectionQuery(query));
                }
            }
        };
        fetchSectionMovies();
    }, [dispatch, sectionResults]);

    return (
        <div className="mt-6 min-h-screen">
            {sectionLoading && Object.keys(sectionResults).length === 0 ? (
                <div className="flex items-center justify-center py-20">
                    <div className="text-gray-400">Loading sections...</div>
                </div>
            ) : (
                sectionQueries.map((query, index) => (
                    <MovieSection 
                        key={index} 
                        query={query} 
                        movies={sectionResults[query] || []}
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