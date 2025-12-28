import { Button } from "@/components/ui/button"
import { useNavigate } from 'react-router-dom';

const promptSuggestions = [
    'small town horror movies',
    'Movies with irredeemable villains',
    'Action thrillers with inconceivable plot twists',
    'Movies directed by Christopher Nolan',
    'Dark psychological thrillers with unreliable narrators',
    'Feel-good romantic comedies from the 90s',
]

function SuggestionButtons() {
    const navigate = useNavigate();

    const handlePromptClick = (query: string) => {
        if (!query.trim()) return;
        
        // Navigate to search page with query parameter
        // SearchResultsPage will handle the API call
        navigate(`/search?q=${encodeURIComponent(query)}`);
    };

    return (
        <div className="flex flex-wrap justify-center gap-3 lg:max-w-4xl mx-auto" role="group" aria-label="Movie search suggestions">
            {promptSuggestions.map((prompt, index) => (
                <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handlePromptClick(prompt)}
                    aria-label={`Search for ${prompt}`}
                    className="rounded-full border-zinc-800 bg-zinc-900/50 text-gray-300 hover:text-white hover:border-amber-500/50 hover:bg-zinc-900 transition-all duration-200"
                >
                    {prompt}
                </Button>
            ))}
        </div>
    )
}

export default SuggestionButtons