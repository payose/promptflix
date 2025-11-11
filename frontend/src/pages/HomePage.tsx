import { useEffect, useState } from 'react';
import SuggestionButtons from '@/components/core/SuggestionButtons';
import SearchBox from '@/components/core/SearchBox';
import Header from '@/components/core/Header';
import HeroSection from '@/components/core/HeroSection';
import SEO from '@/components/SEO/SEO';
// import TrendingMovies from '@/components/core/TrendingMovies';
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

    // Structured data for website
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "PromptFlix",
        "description": "Discover movies with AI-powered recommendations",
        "url": "https://promptflix.com",
        "potentialAction": {
            "@type": "SearchAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://promptflix.com/search?q={search_term_string}"
            },
            "query-input": "required name=search_term_string"
        }
    };

    return (
        <div className="">
            <SEO
                title="PromptFlix - Discover Movies with AI"
                description="Discover your next watch with AI-powered recommendations. Search for movies using natural language and get personalized suggestions instantly."
                url="/"
                structuredData={structuredData}
            />
            <div className="min-h-screen w-screen">
                <Header />
                
                {/* Hero Section */}
                <div className="mt-20">
                    <HeroSection />
                </div>

                <div className="mx-auto lg:px-24 space-y-12 mt-12">
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
