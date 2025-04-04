import { useState, useEffect } from 'react';
import { SearchIcon, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import MovieCard from '@/components/core/movieCard';
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "./store";
import { fetchMoviesResults, queryAIforMovieList } from "@/redux/movieSlice";

const HomePage = () => {
    const [query, setQuery] = useState('');

    const dispatch = useDispatch<AppDispatch>();
    const { moviesList, loading } = useSelector((state: RootState) => state.movies);

    const initialList = [
        { title: "Little Women", year: 2019 },
        { title: "Promising Young Woman", year: 2020 },
        { title: "Nomadland", year: 2021 },
        { title: "Wonder Woman 1984", year: 2020 },
        { title: "Captain Marvel", year: 2019 },
        { title: "The Woman King", year: 2022 },
        { title: "Everything Everywhere All at Once", year: 2022 },
        { title: "Mulan", year: 2020 },
        { title: "Birds of Prey", year: 2020 },
        { title: "Black Widow", year: 2021 },
    ];

    useEffect(() => {
        if (moviesList.length === 0) {
            dispatch(fetchMoviesResults(initialList));
        }
    }, [dispatch, moviesList.length]);
    

    const handleAISearch = async () => {
        dispatch(queryAIforMovieList(query));
    };

    return (
        <div className="">
            <div className="min-h-screen w-screen bg-gradient-to-b from-gray-900 to-gray-800 p-6">
                <div className="mx-auto md:px-24 space-y-12 mt-10">
                    {/* Header Section */}
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                            PromptFlix
                        </h1>
                        <p className="text-gray-400">Discover films through the power of artificial intelligence</p>
                    </div>

                    {/* Search Section */}
                    <div className='md:px-20'>
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
                                            onClick={handleAISearch}
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
                                    {loading && (
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

                        <div className="text-center text-gray-500 text-sm pt-4">
                            Try: "A mind-bending sci-fi movie like Inception" or "Feel-good romantic comedies from the 90s"
                        </div>
                    </div>

                    <div className='mt-4'>
                        <div className='mt-6'>
                            <h2 className="text-xl text-gray-300 mb-4">
                                Example Results for: "Mind-bending sci-fi movies that make you think"
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-12 gap-y-10">
                                {moviesList.map((movie) => (
                                    <MovieCard
                                        key={movie.id}
                                        movie={movie}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default HomePage;
