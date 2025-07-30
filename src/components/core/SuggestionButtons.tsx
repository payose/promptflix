import { Button } from "@/components/ui/button"
import { useNavigate } from 'react-router-dom';

const suggestedQueries = [
    'A mind-bending sci-fi movie like Inception',
    'Feel-good romantic comedies from the 90s',
    'Movies directed by Christopher Nolan',
    'Feel-good romantic comedies from the 90s',
]

function SuggestionButtons() {
    const navigate = useNavigate();

    const fetchSuggestion = (query: string) => {
        if (!query.trim()) return;
        
        // Navigate to search page with query parameter
        // SearchResultsPage will handle the API call
        navigate(`/search?q=${encodeURIComponent(query)}`);
    };

    return (
        <div className="pt-4 flex flex-wrap justify-center gap-2">
            {suggestedQueries.map((query, index) => (
                <span className="rounded-full" key={index}>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-gray-100 bg-transparent hover:bg-transparent transition rounded-full"
                        onClick={() => fetchSuggestion(query)}
                    >
                        {query}
                    </Button>
                </span>
            ))}
        </div>
    )
}

export default SuggestionButtons