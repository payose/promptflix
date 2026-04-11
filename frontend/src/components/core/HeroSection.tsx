import SearchBox from '@/components/core/SearchBox';
import SuggestionButtons from '@/components/core/SuggestionButtons';

export default function HeroSection() {
    return (
        <div className="w-full">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:pt-20 lg:pb-24">
                {/* Main heading */}
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-light text-center mb-12 text-white tracking-tight">
                    Find your next movie
                </h2>

                {/* Search Box */}
                <div className="max-w-2xl mx-auto mb-10">
                    <SearchBox />
                </div>

                {/* Prompt suggestions */}
                <div className="max-w-2xl mx-auto">
                    <p className="text-sm text-gray-500 text-center mb-4">
                        Try asking:
                    </p>
                    <SuggestionButtons />
                </div>
            </div>
        </div>
    );
}