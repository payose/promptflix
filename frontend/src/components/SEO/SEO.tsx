import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: 'website' | 'article' | 'video.movie';
    structuredData?: object;
}

const SEO: React.FC<SEOProps> = ({
    title = 'FindsMovies - AI Movie Finder for Movies & TV Shows',
    description = 'Find movies and TV shows with AI recommendations. Describe your mood, genre, theme or favorite title and get personalized picks with ratings, trailers and watch options.',
    keywords = 'AI movie finder, movie recommendations, TV show recommendations, find movies to watch, personalized movie suggestions, movie discovery, film search, anime recommendations, K-drama recommendations',
    image = '/og-image.png',
    url,
    type = 'website',
    structuredData
}) => {
    const siteUrl = import.meta.env.VITE_SITE_URL || 'https://findsmovies.com';
    const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
    const fullImageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;
    const fullTitle = title.includes('FindsMovies') ? title : `${title} | FindsMovies`;

    return (
        <Helmet>
            {/* Primary Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="title" content={fullTitle} />
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />

            {/* Canonical URL */}
            <link rel="canonical" href={fullUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={fullImageUrl} />
            <meta property="og:site_name" content="FindsMovies" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={fullUrl} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={fullImageUrl} />

            {/* Additional Meta Tags */}
            <meta name="robots" content="index, follow" />
            <meta name="language" content="English" />
            <meta name="revisit-after" content="7 days" />
            <meta name="author" content="FindsMovies" />

            {/* Structured Data */}
            {structuredData && (
                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
            )}
        </Helmet>
    );
};

export default SEO;
