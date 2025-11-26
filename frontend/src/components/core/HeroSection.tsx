import { Sparkles, Zap, Film } from 'lucide-react';
import SearchBox from '@/components/core/SearchBox';
import SuggestionButtons from '@/components/core/SuggestionButtons';

export default function HeroSection() {

    return (
        <div className="relative w-full overflow-hidden">
            {/* Animated gradient background - Pink, Purple, Amber */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-amber-900/15 animate-pulse" />
            
            {/* Grid pattern overlay - tech feel */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8b5cf620_1px,transparent_1px),linear-gradient(to_bottom,#8b5cf620_1px,transparent_1px)] bg-[size:14px_24px]" />
            
            {/* Glow effects - Pink, Purple, Amber */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute top-1/3 right-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl animate-pulse delay-700" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
            
            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 lg:pb-40">
                {/* Main heading */}
                <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-center mb-6 leading-tight">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400">
                        Discover the Perfect Movie
                    </span>
                    <br />
                    <span className="text-gray-200">
                        for Your Mood
                    </span>
                </h1>

                {/* Search Box */}
                <div className="max-w-3xl mx-auto mb-8">
                    <SearchBox />
                </div>

                {/*Prompt suggestions */}
                <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Film className="w-5 h-5 text-amber-500" />
                        <p className="text-sm font-medium text-gray-300">Try these prompts:</p>
                    </div>

                    <div className="mb-14">
                        <SuggestionButtons />
                    </div>
                </div>

                {/* Decorative elements */}
                {/* <div className="mt-16 flex justify-center gap-3 lg:gap-8 opacity-40">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                        <span className="text-xs text-gray-400 text-nowrap">AI-Powered</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse delay-300" />
                        <span className="text-xs text-gray-400 text-nowrap">Highly Rated Movies</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse delay-700" />
                        <span className="text-xs text-gray-400 text-nowrap">Instant Results</span>
                    </div>
                </div> */}
            </div>
        </div>
    );
}