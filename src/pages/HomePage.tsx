import { useEffect, useState } from 'react';
import SuggestionButtons from '@/components/core/SuggestionButtons';
import SearchBox from '@/components/core/SearchBox';
import Header from '@/components/core/Header';
import TrendingMovies from '@/components/core/TrendingMovies';
import SectionResults from '@/components/core/SectionResults';
// import MovieCard from '@/components/core/movieCard';
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "./store";
import { fetchMoviesResults, queryAIforMovieList } from "@/redux/movieSlice";

const HomePage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { movies } = useSelector((state: RootState) => state.movies);

      const [scrolled, setScrolled] = useState(false)
    
      useEffect(() => {
        const handleScroll = () => {
          setScrolled(window.scrollY > 200)
        }
    
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
      }, [])

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
        if (movies.length === 0) {
            const fetchInitialMovies = async () => {
                try {
                    const moviePromises = initialList.map((movie) =>
                        dispatch(fetchMoviesResults(movie)).unwrap()
                    );
                    await Promise.all(moviePromises);
                } catch (error) {
                    console.error('Error fetching initial movies:', error);
                }
            };
            fetchInitialMovies();
        }
    }, [dispatch, movies.length]);
    

    return (
        <div className="">
            <div className="min-h-screen w-screen">
                <Header />
                <TrendingMovies />
                <div className="mx-auto lg:px-24 space-y-12 mt-10">

                    {/* Search Section */}
                    <div className='md:px-20'>
                        <div className="lg:px-28">
                           {!scrolled && ( 
                                <div className="transform translate-y-3 transition-opacity duration-500 ease-out">
                                    <SearchBox />
                                </div>
                        )}

                            {/* <div className="relative flex items-center p-[0.5px] rounded-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 focus-within:shadow-sm focus-within:shadow-pink-500/40 transition-all">
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Describe your perfect movie..."
                                    className="w-full p-4 pr-12 rounded-lg bg-gray-900 border border-transparent text-gray-100 placeholder-gray-500 focus:outline-none"
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
                            </div> */}

                            {/* AI Typing Indicator */}
                            {/* {loading && (
                                <div className="absolute left-4 -bottom-6 flex items-center gap-2 text-sm text-blue-400">
                                    <div className="flex gap-1">
                                        <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                    <span>AI processing query...</span>
                                </div>
                            )} */}
                        </div>

                        <div className=" pt-4">
                            {/* Try:  */}
                            <SuggestionButtons onSelect={(value) => setQuery(value)} />
                        </div>
                    </div>

                    <div className='mt-4'>
                            <SectionResults />
                        
                    </div>

                </div>
            </div>
        </div>
    );
};

export default HomePage;
