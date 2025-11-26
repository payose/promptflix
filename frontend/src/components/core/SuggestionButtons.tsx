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
        <div className="flex flex-wrap justify-center gap-3 lg:max-w-4xl mx-auto">
            {promptSuggestions.map((prompt, index) => (
                <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handlePromptClick(prompt)}
                    className="group relative overflow-hidden rounded-full border-purple-500/30 bg-gray-900/50 backdrop-blur-sm text-gray-300 hover:text-white hover:border-amber-500 hover:bg-gray-900/50 transition-all duration-300"
                >
                    <span className="relative z-10">{prompt}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-amber-500/0 to-cyan-500/0 group-hover:from-purple-500/10 group-hover:via-amber-500/10 group-hover:to-cyan-500/10 transition-all duration-300" />
                </Button>
            ))}
        </div>
    )
}

export default SuggestionButtons