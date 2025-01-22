import React, { useState, useEffect } from 'react';
import { SearchIcon, Loader2, Stars, Film, ThumbsUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';


interface Movie {
    id: string;
    title: string;
    vote_average: number;
    overview: string;
    poster_path: string;
    backdrop_path: string;
    release_date: string;
};

const App = () => {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<Movie[]>([]);
    const [isTyping, setIsTyping] = useState(false);

    const exampleMovies = [
        {
            id: 1,
            title: "Inception",
            release_date: "2010",
            overview: "A thief who steals corporate secrets through dream-sharing technology is given the task of planting an idea into the mind of a C.E.O.",
            vote_average: 8.8,
            genres: ["Sci-fi", "Action"],
            posterPath: "/api/placeholder/300/450"
        },
        {
            id: 2,
            title: "The Matrix",
            release_date: "1999",
            overview: "A computer programmer discovers a mysterious world of AI and machine consciousness.",
            vote_average: 8.7,
            genres: ["Sci-fi", "Action"],
            posterPath: "/api/placeholder/300/450"
        },
        {
            id: 3,
            title: "Interstellar",
            release_date: "2014",
            overview: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
            vote_average: 8.6,
            genres: ["Sci-fi", "Adventure"],
            posterPath: "/api/placeholder/300/450"
        },
        {
            id: 4,
            title: "Blade Runner 2049",
            release_date: "2017",
            overview: "A young blade runner's discovery of a long-buried secret leads him to track down former blade runner Rick Deckard.",
            vote_average: 8.0,
            genres: ["Sci-fi", "Drama"],
            posterPath: "/api/placeholder/300/450"
        },
        {
            id: 5,
            title: "Ex Machina",
            release_date: "2014",
            overview: "A young programmer is selected to participate in a ground-breaking experiment in synthetic intelligence.",
            vote_average: 7.7,
            genres: ["Sci-fi", "Drama"],
            posterPath: "/api/placeholder/300/450"
        },
        {
            id: 6,
            title: "Arrival",
            release_date: "2016",
            overview: "A linguist works with the military to communicate with alien lifeforms after twelve mysterious spacecraft appear around the world.",
            vote_average: 7.9,
            genres: ["Sci-fi", "Drama"],
            posterPath: "/api/placeholder/300/450"
        }
    ];

    // Simulated AI thinking effect
    useEffect(() => {
        if (query) {
            setIsTyping(true);
            const timeout = setTimeout(() => setIsTyping(false), 1000);
            return () => clearTimeout(timeout);
        }
    }, [query]);

    const handleSearch = () => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setResults([
                {
                    id: "377d",
                    title: "The Matrix",
                    release_date: "1999",
                    overview: "A computer programmer discovers a mysterious world of AI and machine consciousness.",
                    vote_average: 8.7,
                    poster_path: "string",
                    backdrop_path: "string"
                },
                // Add more mock results as needed
            ]);
            setLoading(false);
        }, 2000);
    };

    return (
        <div className="">
            <div className="min-h-screen w-screen bg-gradient-to-b from-gray-900 to-gray-800 p-6">
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Header Section */}
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                            PromptFlix
                        </h1>
                        <p className="text-gray-400">Discover films through the power of artificial intelligence</p>
                    </div>

                    {/* Search Section */}
                    <Card className="bg-gray-800/50 border-gray-700">
                        <CardContent className="pt-6">
                            <div className="relative">
                                <div className="relative flex items-center">
                                    <input
                                        type="text"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Describe your perfect movie..."
                                        className="w-full p-4 pr-12 rounded-lg bg-gray-900 border border-gray-700 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                    <button
                                        onClick={handleSearch}
                                        disabled={loading || !query}
                                        className="absolute right-2 p-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed transition-all"
                                    >
                                        {loading ? (
                                            <Loader2 className="h-5 w-5 text-gray-200 animate-spin" />
                                        ) : (
                                            <SearchIcon className="h-5 w-5 text-gray-200" />
                                        )}
                                    </button>
                                </div>

                                {/* AI Typing Indicator */}
                                {isTyping && (
                                    <div className="absolute left-4 -bottom-6 flex items-center gap-2 text-sm text-blue-400">
                                        <div className="flex gap-1">
                                            <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                        <span>AI processing query...</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="text-center text-gray-500 text-sm">
                        Try: "A mind-bending sci-fi movie like Inception" or "Feel-good romantic comedies from the 90s"
                    </div>

                    <div className='mt-4'>
                        {!results.length ? (
                            <div>
                                <h2 className="text-xl text-gray-300 mb-4">
                                    Example Results for: "Mind-bending sci-fi movies that make you think"
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {exampleMovies.map((movie) => (
                                        <Card key={movie.id} className="bg-gray-800/50 border-gray-700 overflow-hidden group hover:border-blue-500 transition-all">
                                            <div className="relative aspect-[2/3] overflow-hidden">
                                                <img
                                                    src={movie.posterPath}
                                                    alt={movie.title}
                                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            </div>
                                            <CardHeader>
                                                <CardTitle className="text-gray-100">{movie.title}</CardTitle>
                                                <CardDescription className="text-gray-400">
                                                    {movie.release_date} | {movie.genres.join(', ')}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-gray-300 text-sm line-clamp-2">{movie.overview}</p>
                                            </CardContent>
                                            <CardFooter className="flex justify-between text-gray-400">
                                                <div className="flex items-center gap-2">
                                                    <Stars className="h-4 w-4 text-yellow-500" />
                                                    <span>{movie.vote_average}/10</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <ThumbsUp className="h-4 w-4" />
                                                    <span>Recommended</span>
                                                </div>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        ) : (

                            <div className="space-y-4">
                                {results.map((movie) => (
                                    <Card key={movie.id} className="bg-gray-800/50 border-gray-700 overflow-hidden group hover:border-blue-500 transition-all">
                                        <CardHeader>
                                            <CardTitle className="text-gray-100 flex items-center gap-2">
                                                <Film className="h-5 w-5 text-blue-400" />
                                                {movie.title}
                                            </CardTitle>
                                            <CardDescription className="text-gray-400">
                                                Released: {movie.release_date} | Sci-fi Crime Romance
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-gray-300">{movie.overview}</p>
                                        </CardContent>
                                        <CardFooter className="flex justify-between text-gray-400">
                                            <div className="flex items-center gap-2">
                                                <Stars className="h-4 w-4 text-yellow-500" />
                                                <span>{movie.vote_average}/10</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <ThumbsUp className="h-4 w-4" />
                                                <span>Recommended</span>
                                            </div>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default App;
