import { useEffect, useState } from 'react'
import { useSelector } from "react-redux";
import { SearchIcon, Loader2 } from 'lucide-react';
import { RootState } from "@/redux/store";
import { useNavigate } from 'react-router-dom';

export default function SearchBox() {
    const [query, setQuery] = useState('');
    const { loading } = useSelector((state: RootState) => state.movies);

    // Get URL parameters
    const getUrlParams = () => {
        const params = new URLSearchParams(window.location.search);
        return params.get('q') || '';
    };

    // Initialize search from URL on component mount
    useEffect(() => {
        const initialQuery = getUrlParams();
        if (initialQuery) {
            setQuery(initialQuery);
        }
    }, []);

    // Handle browser back/forward buttons
    useEffect(() => {
        const handlePopState = () => {
            const queryFromUrl = getUrlParams();
            setQuery(queryFromUrl);
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    // Handle input change without URL updates
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newQuery = e.target.value;
        setQuery(newQuery);
    };

    const navigate = useNavigate();

    const handleAISearch = async () => {
        if (!query.trim()) return;
        
        // Navigate to search page with query parameter
        // SearchResultsPage will handle the API call
        navigate(`/search?q=${encodeURIComponent(query)}`);
    };

    const truncateLenghtyQuery = (text: string, maxLength: number = 50) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <div className="w-full">
            <div className="relative w-full flex items-center group">
                {/* Gradient border effect - Pink, Purple, Amber */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/50 via-pink-500/50 to-amber-500/50 opacity-0 group-focus-within:opacity-100 blur-sm transition-opacity duration-300" />
                
                <div className="relative w-full flex items-center rounded-full border border-purple-500/30 bg-gray-900/80 backdrop-blur-sm focus-within:border-pink-500/60 focus-within:shadow-lg focus-within:shadow-pink-500/20 transition-all duration-300">
                    <input
                        type="text"
                        value={query}
                        onChange={handleInputChange}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleAISearch();
                            }
                        }}
                        placeholder="Describe your perfect movie..."
                        className="w-full px-4 sm:px-6 py-2.5 sm:py-3 pr-12 sm:pr-14 rounded-full bg-transparent border-transparent text-sm sm:text-base text-gray-100 placeholder-gray-400 focus:outline-none"
                        maxLength={200}
                    />
                    <button
                        onClick={handleAISearch}
                        disabled={loading || !query.trim()}
                        className="absolute right-1.5 sm:right-2 p-1.5 sm:p-2 rounded-full bg-amber-500 hover:from-purple-600 hover:via-pink-600 hover:to-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-pink-500/30"
                        title={query.length > 50 ? query : undefined}
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 text-white animate-spin" />
                        ) : (
                            <SearchIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        )}
                    </button>
                </div>
            </div>
            
            {/* Optional: Display current search query for very long queries */}
            {query && query.length > 50 && (
                <div className="mt-2 px-2">
                    <p className="text-xs text-gray-500">
                        Searching: {truncateLenghtyQuery(query, 80)}
                    </p>
                </div>
            )}
        </div>
    )
}