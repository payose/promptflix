import { useState, useEffect } from 'react';
import { SearchIcon, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import MovieCard from '@/components/core/movieCard';
import type { Movie } from '@/types/movie';
import APIService from "@/api/axios"

const HomePage = () => {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<Movie[]>([]);
    // const [loading, setLoading] = useState(false);


    const exampleMovies = [
        {
            id: 464052,
            title: "Inception",
            release_date: "2010-09-09",
            overview: "A thief who steals corporate secrets through dream-sharing technology is given the task of planting an idea into the mind of a C.E.O.",
            vote_average: 8.8,
            genre_id: [77, 33],
            poster_path: "/h4VB6m0RwcicVEZvzftYZyKXs6K.jpg"
        },
        {
            id: 736168,
            title: "The Matrix",
            release_date: "1999",
            overview: "A computer programmer discovers a mysterious world of AI and machine consciousness.",
            vote_average: 8.7,
            genres: ["Sci-fi", "Action"],
            poster_path: "/h4VB6m0RwcicVEZvzftYZyKXs6K.jpg"
        },
        {
            id: 343611,
            title: "Interstellar",
            release_date: "2014",
            overview: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
            vote_average: 8.6,
            genres: ["Sci-fi", "Adventure"],
            poster_path: "/h4VB6m0RwcicVEZvzftYZyKXs6K.jpg"
        },
        {
            id: 4,
            title: "Blade Runner 2049",
            release_date: "2017",
            overview: "A young blade runner's discovery of a long-buried secret leads him to track down former blade runner Rick Deckard.",
            vote_average: 8.0,
            genres: ["Sci-fi", "Drama"],
            poster_path: "/h4VB6m0RwcicVEZvzftYZyKXs6K.jpg"
        },
        {
            id: 5,
            title: "Ex Machina",
            release_date: "2014",
            overview: "A young programmer is selected to participate in a ground-breaking experiment in synthetic intelligence.",
            vote_average: 7.7,
            genres: ["Sci-fi", "Drama"],
            poster_path: "/h4VB6m0RwcicVEZvzftYZyKXs6K.jpg"
        },
        {
            id: 6,
            title: "Arrival",
            release_date: "2016",
            overview: "A linguist works with the military to communicate with alien lifeforms after twelve mysterious spacecraft appear around the world.",
            vote_average: 7.9,
            genres: ["Sci-fi", "Drama"],
            poster_path: "/h4VB6m0RwcicVEZvzftYZyKXs6K.jpg"
        }
    ];

    // Simulated AI thinking effect
    useEffect(() => {
        // if (query) {
        //     setLoading(true);
        //     const timeout = setTimeout(() => setLoading(false), 1000);
        //     return () => clearTimeout(timeout);
        // }
    }, []);

    const handleAISearch = async () => {
        setLoading(true);
        const queryResult =
            [
                { "title": "Little Women", "year": 2019 },
                { "title": "Promising Young Woman", "year": 2020 },
                { "title": "Nomadland", "year": 2021 },
                { "title": "Wonder Woman 1984", "year": 2020 },
                { "title": "Captain Marvel", "year": 2019 },
                { "title": "The Woman King", "year": 2022 },
                { "title": "Everything Everywhere All at Once", "year": 2022 },
                { "title": "Mulan", "year": 2020 },
                { "title": "Birds of Prey", "year": 2020 },
                { "title": "Black Widow", "year": 2021 }
            ];  
        try {
            // const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            //     method: 'POST',

            //     headers: {
            //         'Content-Type': 'application/json',
            //         'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
            //     },

            //     body: JSON.stringify({
            //         model: "gpt-3.5-turbo",
            //         messages: [{
            //             "role": "system",
            //             "content": "You are a knowledgeable assistant with expertise in movies and TV shows. Your task is to recommend 10 movies based on the user's prompt. Each recommendation should be an object containing the movie title and the year of release. If there are multiple movies that match the user's criteria, prioritize those that are more recently released with higher ratings. Return the results as a JSON array of 10 objects, strictly adhering to this format: [{\"title\": \"Movie Title\", \"year\": 2023}, ...]. Do not include additional commentary or formatting."
            //         }, {
            //             role: "user",
            //             content: query
            //         }]
            //     })
            // });

            // const nlpResult = await openaiResponse.json();
            // const searchParams = JSON.parse(nlpResult.choices[0].message.content);
            

            // Step 2: Search TMDB with extracted parameters    
            fetchMovie(queryResult)

            // const movies = await tmdbResponse.json();
            // setResults(movies.results.slice(0, 5));
        } catch (error) {
            console.error('Error:', error);
        }
        setLoading(false);
    };

    const fetchMovie = async (queryResult: any[]) => {
        try {
            // Use Promise.all to handle multiple async operations
            const moviePromises = queryResult.map(async (result) => {
                const response = await APIService.getInstance('tmdb').get(`/search/movie?query=${result.title}&year=${result.year}`);
                
                if (response.data.results && response.data.results[0]) {
                    const transformedMovie: Movie = response.data.results[0];
                    console.log(response.data)
                    return transformedMovie;
                }
                return null;
            });
    
            // Wait for all promises to resolve
            const newMovies = await Promise.all(moviePromises);
            
            // Filter out null values and update state
            const validMovies = newMovies.filter((movie): movie is Movie => movie !== null);
            setResults(prevResults => [...prevResults, ...validMovies]);
            
        } catch (error) {
            console.error('Error fetching movie data:', error);
        }
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
                        {!results.length ? (
                            <div className='mt-6'>
                                <h2 className="text-xl text-gray-300 mb-4">
                                    Example Results for: "Mind-bending sci-fi movies that make you think"
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-10 gap-y-10">
                                    {exampleMovies.map((movie) => (
                                        <MovieCard
                                            key={movie.id}
                                            movie={movie}
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 mt-6">
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-10 gap-y-10">
                                    {results.map((movie) => (
                                        <MovieCard
                                            key={movie.id}
                                            movie={movie}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default HomePage;
