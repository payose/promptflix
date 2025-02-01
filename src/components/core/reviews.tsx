import React, { useState } from 'react';
import { Star, ChevronDown } from 'lucide-react';


interface Review {
    id: number;
    author: string;
    content: string;
    rating: number;
    created_at: string;
    avatar_path?: string;
    helpful_count: number;
    author_details: unknown;
    unhelpful_count: number;
    url: string
}


const ReviewCard: React.FC<{ review: Review }> = ({ review }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };
  
    // const getAvatarUrl = (path: string | null) => {
    //   if (!path) return '/api/placeholder/40/40';
    //   if (path.startsWith('/http')) return path.slice(1);
    //   return `https://image.tmdb.org/t/p/w45${path}`;
    // };
  
    return (
      <div className="bg-gray-800/50 rounded-lg p-6 space-y-4">
        {/* Review Header */}
        <div className="flex items-center gap-4">
          {/* <img 
            src={getAvatarUrl(review.author_details.avatar_path)}
            alt={review.author}
            className="w-10 h-10 rounded-full object-cover"
          /> */}
          <div className="flex-1">
            {/* <h4 className="text-gray-200 font-medium">
              {review.author_details.name || review.author_details.username || review.author}
            </h4>
            <div className="flex items-center gap-2">
              {review.author_details.rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-yellow-500">{review.author_details.rating}/10</span>
                </div>
              )} */}
              <span className="text-gray-400 text-sm">
                {formatDate(review.created_at)}
              </span>
            {/* </div> */}
          </div>
        </div>
  
        {/* Review Content */}
        <div className="text-gray-300">
          <p className={`${!isExpanded && 'line-clamp-2'} text-sm`}>
            {review.content}
          </p>
          {review.content.length > 200 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-400 hover:text-blue-300 text-sm mt-2 flex items-center gap-1"
            >
              {isExpanded ? 'Show less' : 'Read more'}
              <ChevronDown className={`w-4 h-4 transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
  
        {/* Review Footer */}
       
      </div>
    );
  };

  export default ReviewCard