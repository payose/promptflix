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
        "name": "FindsMovies",
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
        <>
            <SEO
                title="FindsMovies - Discover Movies with AI"
                description="Discover your next watch with AI-powered recommendations. Search for movies using natural language and get personalized suggestions instantly."
                url="/"
                structuredData={structuredData}
            />

            {/* Skip to main content link for keyboard users */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-purple-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
                Skip to main content
            </a>

            <div className="min-h-screen w-screen relative bg-black">
                <Header hideSearchBox={isHeroVisible} />

                {/* Main content area */}
                <main id="main-content" className="mt-20 bg-black">
                    {/* Hero Section */}
                    <section
                        ref={heroRef}
                        aria-label="Search for movies"
                        className="relative"
                    >
                        <HeroSection />
                    </section>

                    {/* Movie recommendations section */}
                    <section
                        id="examples-section"
                        aria-label="Movie recommendations"
                        className="mx-auto space-y-12 mt-4"
                    >
                        <SectionResults />
                    </section>
                </main>
            </div>
        </>
    );
};

export default HomePage;
