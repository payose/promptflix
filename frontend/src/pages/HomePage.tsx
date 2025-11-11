import Header from '@/components/core/Header';
import HeroSection from '@/components/core/HeroSection';
import SEO from '@/components/SEO/SEO';
// import TrendingMovies from '@/components/core/TrendingMovies';
import SectionResults from '@/components/core/SectionResults';

const HomePage = () => {

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
                    <div className='mt-4'>
                        <SectionResults />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
