import { Button } from "@/components/ui/button"

const suggestions = [
  'A mind-bending sci-fi movie like Inception',
  'Feel-good romantic comedies from the 90s',
  'Movies directed by Christopher Nolan',
  'Feel-good romantic comedies from the 90s',
]

function SuggestionButtons({ onSelect }: { onSelect: (value: string) => void }) {
  return (
    <div className="pt-4 flex flex-wrap justify-center gap-2 ">
      {suggestions.map((text, index) => (
        <span className="rounded-full" key={index}>
            <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-gray-100 bg-transparent hover:bg-transparent transition rounded-full"
                onClick={() => onSelect(text)}
            >
            {text}
            </Button>
        </span>
      ))}
    </div>
  )
}

export default SuggestionButtons