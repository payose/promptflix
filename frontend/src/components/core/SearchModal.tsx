import { useEffect, useState } from 'react';
import { X, Sparkles, Film, Tv, Play, Clapperboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialQuery?: string;
}

type FilterType = 'all' | 'movies' | 'tv-shows' | 'anime' | 'k-drama';

const filters: { value: FilterType; label: string; icon: typeof Film }[] = [
    { value: 'all', label: 'All', icon: Play },
    { value: 'movies', label: 'Movies', icon: Film },
    { value: 'tv-shows', label: 'TV Shows', icon: Tv },
    { value: 'anime', label: 'Anime', icon: Sparkles },
    { value: 'k-drama', label: 'K-Drama', icon: Clapperboard },
];

export default function SearchModal({ isOpen, onClose, initialQuery = '' }: SearchModalProps) {
    const [query, setQuery] = useState(initialQuery);
    const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
    const navigate = useNavigate();

    // Character count validation
    const isValidLength = query.trim().length >= 10 && query.trim().length <= 250;
    const canSubmit = isValidLength;

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    // Update query when initialQuery changes
    useEffect(() => {
        if (initialQuery) {
            setQuery(initialQuery);
        }
    }, [initialQuery]);

    const handleSearch = () => {
        if (!canSubmit) return;

        const params = new URLSearchParams();
        params.set('q', query.trim());
        if (selectedFilter !== 'all') {
            params.set('filter', selectedFilter);
        }

        navigate(`/search?${params.toString()}`);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-3xl bg-gray-900/95 rounded-2xl shadow-2xl border border-purple-500/30 overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Gradient border effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-amber-500/20 blur-xl" />

                <div className="relative bg-gray-900/95 rounded-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-purple-500/20">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-amber-500" />
                            <h2 className="text-xl font-semibold text-gray-100">
                                What are you in the mood to watch?
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-gray-800 transition-colors text-gray-400 hover:text-gray-200"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Main Content */}
                    <div className="p-6 space-y-6">
                        {/* Large Textarea */}
                        <div className="space-y-2">
                            <textarea
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                maxLength={250}
                                placeholder="Describe your perfect movie in detail... e.g., 'A mind-bending thriller that makes me question reality, with complex characters and stunning cinematography'"
                                className="w-full h-32 px-4 py-3 bg-gray-800/50 border border-purple-500/30 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 resize-none transition-all"
                                autoFocus
                            />
                            <div className="flex items-center justify-between text-xs">
                                <span className={`${
                                    query.trim().length < 10
                                        ? 'text-amber-500'
                                        : isValidLength
                                        ? 'text-green-500'
                                        : 'text-red-500'
                                }`}>
                                    {query.trim().length < 10
                                        ? `Minimum ${10 - query.trim().length} more characters required`
                                        : isValidLength
                                        ? 'Ready to search'
                                        : 'Maximum character limit reached'}
                                </span>
                                <span className={`${query.length > 240 ? 'text-amber-500' : 'text-gray-500'}`}>
                                    {query.length}/250
                                </span>
                            </div>
                        </div>

                        {/* Content Type Filters */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                <Film className="w-4 h-4" />
                                Content Type <span className="text-gray-600 font-normal">(Optional)</span>
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {filters.map((filter) => {
                                    const Icon = filter.icon;
                                    const isSelected = selectedFilter === filter.value;
                                    return (
                                        <button
                                            key={filter.value}
                                            onClick={() => setSelectedFilter(filter.value)}
                                            className={`group relative overflow-hidden flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                                                isSelected
                                                    ? 'bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-amber-500/20 border-2 border-pink-500/60'
                                                    : 'bg-gray-800/50 hover:bg-gray-800 border border-purple-500/20 hover:border-pink-500/40'
                                            }`}
                                        >
                                            <Icon className={`w-4 h-4 transition-colors ${
                                                isSelected ? 'text-amber-400' : 'text-gray-400 group-hover:text-amber-400'
                                            }`} />
                                            <span className={`text-sm transition-colors ${
                                                isSelected ? 'text-white font-medium' : 'text-gray-300 group-hover:text-white'
                                            }`}>
                                                {filter.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between gap-3 p-6 border-t border-purple-500/20 bg-gray-800/30">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-lg border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSearch}
                            disabled={!canSubmit}
                            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 hover:from-purple-600 hover:via-pink-600 hover:to-amber-600 text-white font-medium shadow-lg shadow-pink-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            Search Movies
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
