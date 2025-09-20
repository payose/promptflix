import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Star, Calendar } from 'lucide-react';

// Mock trending movies data (replace with TMDB API call)

const mockMovies = [
    {
        id: 1,
        title: "Guardians of the Galaxy Vol. 3",
        poster: "https://image.tmdb.org/t/p/w500/r2J02Z2OpNTctfOSN1Ydgii51I3.jpg",
        rating: 8.2,
        releaseDate: "2023-05-05",
        overview: "Peter Quill, still reeling from the loss of Gamora, must rally his team around him to defend the universe."
    },
    {
        id: 2,
        title: "Spider-Man: Across the Spider-Verse",
        poster: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
        rating: 8.7,
        releaseDate: "2023-06-02",
        overview: "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People."
    },
    {
        id: 3,
        title: "Fast X",
        poster: "https://image.tmdb.org/t/p/w500/fiVW06jE7z9YnO4trhaMEdclSiC.jpg",
        rating: 7.1,
        releaseDate: "2023-05-19",
        overview: "Dom Toretto and his family are targeted by the vengeful son of drug kingpin Hernan Reyes."
    },
    {
        id: 4,
        title: "John Wick: Chapter 4",
        poster: "https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg",
        rating: 7.8,
        releaseDate: "2023-03-24",
        overview: "John Wick uncovers a path to defeating The High Table. But before he can earn his freedom..."
    },
    {
        id: 5,
        title: "The Little Mermaid",
        poster: "https://image.tmdb.org/t/p/w500/ym1dxyOk4jFcSl4Q2zmRrA5BEEN.jpg",
        rating: 7.2,
        releaseDate: "2023-05-26",
        overview: "The youngest of King Triton's daughters, and the most defiant, Ariel longs to find out more about the world beyond the sea."
    },
    {
        id: 6,
        title: "Transformers: Rise of the Beasts",
        poster: "https://image.tmdb.org/t/p/w500/gPbM0MK8CP8A174rmUwGsADNYKD.jpg",
        rating: 6.8,
        releaseDate: "2023-06-09",
        overview: "When a new threat capable of destroying the entire planet emerges, they must work together with a powerful faction known as the Maximals."
    },
    {
        id: 7,
        title: "Indiana Jones and the Dial of Destiny",
        poster: "https://image.tmdb.org/t/p/w500/Af4bXE63pVsb2FtbW8uYIyPBadD.jpg",
        rating: 6.9,
        releaseDate: "2023-06-30",
        overview: "Finding himself in a new era, approaching retirement, Indy wrestles with fitting into a world that seems to have outgrown him."
    },
    {
        id: 8,
        title: "Oppenheimer",
        poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
        rating: 8.4,
        releaseDate: "2023-07-21",
        overview: "The story of J. Robert Oppenheimer's role in the development of the atomic bomb during World War II."
    }
];

const TrendingMoviesCarousel = () => {
    const [api, setApi] = useState(null);
    const [current, setCurrent] = useState(0);
    const [movies] = useState(mockMovies);

    // Auto-scroll functionality
    useEffect(() => {
        if (!api) return;

        const interval = setInterval(() => {
            if (api.canScrollNext()) {
                api.scrollNext();
            } else {
                api.scrollTo(0);
            }
        }, 7000);

        return () => clearInterval(interval);
    }, [api]);

    // Track current slide
    useEffect(() => {
        if (!api) return;

        api.on('select', () => {
            setCurrent(api.selectedScrollSnap());
        });
    }, [api]);

    const formatDate = (dateString) => {
        return new Date(dateString).getFullYear();
    };

    return (
        <div className="w-full relative">
            <Carousel
                setApi={setApi}
                className="w-full h-full"
                opts={{
                    align: "start",
                    loop: true,
                }}
            >
                <CarouselContent className="h-full">
                    {movies.map((movie, index) => (
                        <CarouselItem key={movie.id} className="h-full">
                            <div
                                className="w-full h-[40vh] flex relative rounded-lg overflow-hidden"
                                style={{
                                    backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(15,17,26,0.8)), url(${movie.poster})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat'
                                }}
                            >
                                {/* Content overlay */}
                                <div className="flex items-end pb-10 w-full px-8 md:px-16 lg:px-24 z-20">
                                    
                                    {/* Movie info */}
                                    <div className="flex-1 max-w-2xl text-white/70">
                                        {/* <Badge variant="secondary" className="mb-4 bg-red-600 text-white hover:bg-red-700">
                                            Trending #{index + 1}
                                            </Badge> */}

                                        {/* <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                                            {movie.title}
                                        </h1>

                                        <div className="flex gap-6 mb-4 text-base md:text-lg">
                                            <div className="flex items-center gap-2">
                                                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                                <span className="font-semibold">{movie.rating}</span>
                                            </div>

                                            <div className="flex gap-2">
                                                <Calendar className="w-5 h-5" />
                                                <span>{formatDate(movie.releaseDate)}</span>
                                            </div>
                                        </div>

                                        <p className="text-sm md:text-lg leading-relaxed text-gray-200 max-w-xl line-clamp-3">
                                            {movie.overview}
                                        </p> */}
                                    </div>
                                </div>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>

                {/* Navigation arrows */}
                {/* <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 border-white/20 text-white hover:bg-black/70 hover:text-white" /> */}
                {/* <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 border-white/20 text-white hover:bg-black/70 hover:text-white" /> */}
            </Carousel>

            {/* Hero text */}
            {/* <div className="absolute bottom-0 left-0 w-full z-30">
                <h1 className="text-center text-3xl md:text-4xl lg:text-5xl text-white/70 font-bold mb-4 leading-tight">
                    Discover your perfect movie with AI
                </h1>
            </div> */}
        </div>
    );
};

export default TrendingMoviesCarousel;