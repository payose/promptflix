import { useEffect, useState } from 'react';
import SuggestionButtons from '@/components/core/SuggestionButtons';
import SearchBox from '@/components/core/SearchBox';
import Header from '@/components/core/Header';
import TrendingMovies from '@/components/core/TrendingMovies';
import SectionResults from '@/components/core/SectionResults';

const HomePage = () => {
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 200)
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])


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
                        </div>

                        <div className=" pt-4">
                            <SuggestionButtons />
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
