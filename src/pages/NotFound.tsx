import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="w-screen bg-gradient-to-b from-gray-900 to-gray-800 p-6 text-gray-400">
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="mb-6">The page you're looking for doesn't exist.</p>
      <Link 
        to="/" 
        className="bg-blue-600 text-gray-200 px-4 py-2 rounded hover:bg-blue-700 hover:text-gray-200"
      >
        Return to Home
      </Link>
    </div>
    </div>
  );
}

export default NotFound;
