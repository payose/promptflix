import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from "react-redux";
import { fetchMoviesResults, queryAIforMovieList } from "@/redux/movieSlice";
import { SearchIcon, Loader2 } from 'lucide-react';
import { RootState, AppDispatch } from "./store";
import { useNavigate } from 'react-router-dom';

export default function SearchBox() {
    const [scrolled, setScrolled] = useState(false)
    const [query, setQuery] = useState('');
    const { loading } = useSelector((state: RootState) => state.movies);

    const dispatch = useDispatch<AppDispatch>();

    // Get URL parameters
    const getUrlParams = () => {
        const params = new URLSearchParams(window.location.search);
        return params.get('q') || '';
    };

    // Update URL without page reload
    // const updateUrl = (searchQuery: string) => {
    //     const url = new URL(window.location);
    //     if (searchQuery.trim()) {
    //         url.searchParams.set('q', searchQuery);
    //     } else {
    //         url.searchParams.delete('q');
    //     }
    //     window.history.pushState({}, '', url);
    // };

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10)
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Initialize search from URL on component mount
    useEffect(() => {
        const initialQuery = getUrlParams();
        if (initialQuery) {
            setQuery(initialQuery);
            // Auto-trigger search if there's a query in URL
            dispatch(queryAIforMovieList(initialQuery));
        }
    }, [dispatch]);

    // Handle browser back/forward buttons
    useEffect(() => {
        const handlePopState = () => {
            const queryFromUrl = getUrlParams();
            setQuery(queryFromUrl);
            // Only trigger search if there's a query from URL (user navigated to a search URL)
            if (queryFromUrl) {
                dispatch(queryAIforMovieList(queryFromUrl));
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [dispatch]);

    // Handle input change without URL updates
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newQuery = e.target.value;
        setQuery(newQuery);
    };

    const navigate = useNavigate();

    const handleAISearch = async () => {
        if (!query.trim()) return;
        
        // Navigate to search page with query parameter
        navigate(`/search?q=${encodeURIComponent(query)}`);
        
        // Redux action will be triggered by SearchResultsPage
        dispatch(queryAIforMovieList(query));
    };

    // Truncate long queries for display purposes
    const truncateQuery = (text: string, maxLength: number = 50) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <div className="w-full">
            <div className="relative w-full flex items-center rounded-full border-[0.5px] border-gray-700 focus-within:shadow-sm focus-within:shadow-pink-500/40 transition-all">
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    placeholder="Describe your perfect movie..."
                    className="w-full px-5 py-2.5 pr-12 rounded-full bg-gray-900 border-transparent text-gray-100 placeholder-gray-500 focus:outline-none"
                    maxLength={200} // Prevent extremely long queries
                />
                <button
                    onClick={handleAISearch}
                    disabled={loading || !query.trim()}
                    className="absolute right-3 hover:border-none bg-transparent transition-all disabled:opacity-50"
                    title={query.length > 50 ? query : undefined} // Show full query on hover for long queries
                >
                    {loading ? (
                        <Loader2 className="h-5 w-5 text-gray-200 animate-spin" />
                    ) : (
                        <SearchIcon className="h-6 w-8 text-gray-600 hover:text-gray-400" />
                    )}
                </button>
            </div>
            
            {/* Optional: Display current search query for very long queries */}
            {query && query.length > 50 && (
                <div className="mt-2 px-2">
                    <p className="text-xs text-gray-500">
                        Searching: {truncateQuery(query, 80)}
                    </p>
                </div>
            )}
        </div>
    )
}