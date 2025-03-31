import { useState, useEffect } from 'react';
import { SearchIcon, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import MovieCard from '@/components/core/movieCard';
import APIService from "@/api/axios";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "./store";
import { fetchMoviesResults } from "@/redux/movieSlice";

const HomePage = () => {
    const [query, setQuery] = useState('');

    const dispatch = useDispatch<AppDispatch>();
    const { movies, loading } = useSelector((state: RootState) => state.movies);

    useEffect(() => {
        dispatch(fetchMoviesResults());
    }, [dispatch]);
    

    const handleAISearch = async () => {
        setLoading(true);
     
        try {
            const response = await APIService.getInstance('openai').post("/chat/completions", {
                model: "gpt-3.5-turbo",
                messages: [{
                    "role": "system",
                    "content": "You are a knowledgeable assistant with expertise in movies and TV shows. Your task is to recommend 10 movies based on the user's prompt. Each recommendation should be an object containing the movie title and the year of release. If there are multiple movies that match the user's criteria, prioritize those that are more recently released with higher ratings. Return the results as a JSON array of 10 objects, strictly adhering to this format: [{\"title\": \"Movie Title\", \"year\": 2023}, ...]. Do not include additional commentary or formatting."
                }, {
                    role: "user",
                    content: query
                }]
            });
            
            const queryResult = response.data.choices[0].message.content;
    
            console.log(queryResult);
            try {
                // Parse the JSON string, handling potential formatting issues
                const parsedMovies = JSON.parse(queryResult.replace(/\n/g, '').trim());
                
                // Validate the parsed data
                if (Array.isArray(parsedMovies) && parsedMovies.every(movie => 
                    movie.title && typeof movie.title === 'string' && 
                    movie.year && typeof movie.year === 'number'
                )) {
                    console.log(parsedMovies);
                    fetchMovie(parsedMovies);
                } else {
                    throw new Error('Invalid movie data format');
                }
            } catch (parseError) {
                console.error('Error parsing movie data:', parseError);
                // Optionally, handle parsing error (e.g., show error message to user)
            }
    
        } catch (error) {
            console.error('Error:', error);
        }
        setLoading(false);
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
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-10 gap-y-10">
                                {movies.map((movie) => (
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
