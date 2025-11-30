import { useEffect, useRef, useState } from 'react';
import Header from '@/components/core/Header';
import HeroSection from '@/components/core/HeroSection';
import SEO from '@/components/SEO/SEO';
// import TrendingMovies from '@/components/core/TrendingMovies';
import SectionResults from '@/components/core/SectionResults';

const HomePage = () => {
    const [isHeroVisible, setIsHeroVisible] = useState(true);
    const heroRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                // When HeroSection is visible, hide header search box
                setIsHeroVisible(entry.isIntersecting);
            },
            {
                threshold: 0.1, // Trigger when at least 10% of hero is visible
                rootMargin: '-80px 0px 0px 0px' // Account for header height
            }
        );

        const currentHeroRef = heroRef.current;

        if (currentHeroRef) {
            observer.observe(currentHeroRef);
        }

        return () => {
            if (currentHeroRef) {
                observer.unobserve(currentHeroRef);
            }
        };
    }, []);

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
            <div className="min-h-screen w-screen relative">
                <Header hideSearchBox={isHeroVisible} />

                {/* Hero Section */}
                <div ref={heroRef} className="mt-20">
                    <HeroSection />
                </div>

                <div className="relative -top-28 mx-auto space-y-12">
                    <div id="examples-section" className="mt-4">
                        <SectionResults />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
