import { useEffect, useState } from 'react'
import { SearchIcon } from 'lucide-react';
import SearchModal from './SearchModal';

export default function SearchBox() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [initialQuery, setInitialQuery] = useState('');

    // Get URL parameters
    const getUrlParams = () => {
        const params = new URLSearchParams(window.location.search);
        return params.get('q') || '';
    };

    // Initialize search query from URL on component mount
    useEffect(() => {
        const queryFromUrl = getUrlParams();
        if (queryFromUrl) {
            setInitialQuery(queryFromUrl);
        }
    }, []);

    // Handle browser back/forward buttons
    useEffect(() => {
        const handlePopState = () => {
            const queryFromUrl = getUrlParams();
            setInitialQuery(queryFromUrl);
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    // Keyboard shortcut: Cmd+K or Ctrl+K to open search
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsModalOpen(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <div className="w-full">
                <button
                    onClick={handleOpenModal}
                    className="w-full group relative overflow-hidden"
                >
                    <div className="relative w-full flex items-center justify-between rounded-full border border-purple-500/30 bg-gray-900/80 backdrop-blur-sm group-hover:border-pink-500/60 group-hover:shadow-lg group-hover:shadow-pink-500/20 transition-all duration-300 px-4 sm:px-6 py-2.5 sm:py-3">
                        <div className="flex items-center gap-3 flex-1">
                            <SearchIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-amber-400 transition-colors" />
                            <span className="text-sm sm:text-base text-gray-400 group-hover:text-gray-300 transition-colors">
                                What are you in the mood to watch?
                            </span>
                        </div>
                    </div>
                </button>
            </div>

            {/* Search Modal */}
            <SearchModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                initialQuery={initialQuery}
            />
        </>
    )
}