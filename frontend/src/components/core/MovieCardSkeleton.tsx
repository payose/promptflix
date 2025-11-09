import { Card, CardContent } from '@/components/ui/card';

interface MovieCardSkeletonProps {
    title: string;
    year: number;
}

const MovieCardSkeleton: React.FC<MovieCardSkeletonProps> = ({ title, year }) => {
    return (
        <div className="relative group cursor-default transition-all duration-300 ease-out overflow-hidden rounded-lg">
            <Card className="overflow-hidden bg-gray-900 border-gray-700">
                <CardContent className="p-0 relative">
                    <div className="aspect-[2/3] relative overflow-hidden bg-gray-800">
                        {/* Shimmer effect */}
                        <div className=" inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-shimmer"
                             style={{
                                 backgroundSize: '200% 100%',
                                 animation: 'shimmer 1.5s infinite'
                             }}
                        />

                        {/* Movie info overlay */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-black/40">
                            <div className="">
                                <h3 className="text-white font-bold text-sm mb-2 line-clamp-3">
                                    {title}
                                </h3>
                                <p className="text-gray-300 text-xs">
                                    {year}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* CSS for shimmer animation */}
            <style>{`
                @keyframes shimmer {
                    0% {
                        background-position: -200% 0;
                    }
                    100% {
                        background-position: 200% 0;
                    }
                }
                .animate-shimmer {
                    animation: shimmer 1.5s infinite;
                }
            `}</style>
        </div>
    );
};

export default MovieCardSkeleton;
