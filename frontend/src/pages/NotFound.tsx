import { Link } from 'react-router-dom';

function NotFound() {
    return (
        <>
            {/* Skip to main content link for keyboard users */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-purple-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
                Skip to main content
            </a>

            <div className="w-screen bg-gradient-to-b from-gray-900 to-gray-800 p-6 text-gray-400">
                <main id="main-content" className="flex flex-col items-center justify-center min-h-screen" role="main">
                    <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
                    <p className="mb-6">The page you're looking for doesn't exist.</p>
                    <Link
                        to="/"
                        className="bg-cyan-600 text-gray-200 px-4 py-2 rounded hover:bg-cyan-700 hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                        aria-label="Return to homepage"
                    >
                        Return to Home
                    </Link>
                </main>
            </div>
        </>
    );
}

export default NotFound;
