import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import LazySection from './LazySection';

const sectionQueries = [
    'Mind-bending sci-fi movies that make you cringe',
    'Movies based on novel adaptations',
    'Movies from parallel universes without any superheroes',
    'Movies that make you ponder on the meaning of life',
];

export default function SectionResults() {
    const { sectionError } = useSelector((state: RootState) => state.movies);

    return (
        <div className="mt-8 mb-10 xl:mb-30 min-h-screen">
            {sectionError && (
                <div
                    className="text-center py-10 px-4"
                    role="alert"
                    aria-live="assertive"
                >
                    <p className="text-red-400 text-sm md:text-base">{sectionError}</p>
                </div>
            )}

            <div className="space-y-4">
                {sectionQueries.map((query, index) => (
                    <LazySection
                        key={query}
                        query={query}
                        index={index}
                    />
                ))}
            </div>

            {/* CSS to hide scrollbars */}
            <style>{`
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
}