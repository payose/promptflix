import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useMovieStreaming } from '@/hooks/useMovieStreaming';
import MovieSection from './MovieSection';

interface LazySectionProps {
    query: string;
    index: number;
}

export default function LazySection({ query, index }: LazySectionProps) {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);
    const { partialSections } = useSelector((state: RootState) => state.movies);
    const { streamMovies } = useMovieStreaming({ type: 'section' });

    // Intersection Observer to detect when section enters viewport
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasLoaded) {
                    setIsVisible(true);
                }
            },
            {
                rootMargin: '200px', // Start loading 200px before section is visible
                threshold: 0.01
            }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => {
            if (sectionRef.current) {
                observer.unobserve(sectionRef.current);
            }
        };
    }, [hasLoaded]);

    // Fetch data when section becomes visible (if not cached)
    useEffect(() => {
        // Check both visibility and cache
        const isCached = partialSections[query] && partialSections[query].length > 0;

        if (isVisible && !hasLoaded && !isCached) {
            streamMovies(query);
            setHasLoaded(true);
        } else if (isCached && !hasLoaded) {
            // If cached, mark as loaded immediately
            setHasLoaded(true);
        }
    }, [isVisible, hasLoaded, query, partialSections, streamMovies]);

    const movies = partialSections[query] || [];
    const isCached = partialSections[query] && partialSections[query].length > 0;
    const isLoading = isVisible && !isCached;

    return (
        <div ref={sectionRef} className="min-h-[300px]">
            {isLoading ? (
                // Skeleton loader
                <div className="lg:pl-10">
                    <div className="px-4 md:px-8">
                        <div className="h-7 bg-zinc-800 rounded w-64 mb-6 animate-pulse" />
                        <div className="flex gap-3 md:gap-4 overflow-hidden">
                            {Array.from({ length: 7 }).map((_, idx) => (
                                <div key={idx} className="flex-none w-32 md:w-44 animate-pulse">
                                    <div className="aspect-[2/3] bg-zinc-800 rounded-md" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : movies.length > 0 ? (
                <MovieSection query={query} movies={movies} />
            ) : null}
        </div>
    );
}
