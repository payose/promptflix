import { useEffect, useState } from 'react'
// import { Button } from '@/components/ui/button'
import SearchBox from '@/components/core/SearchBox';

interface HeaderProps {
  hideSearchBox?: boolean;
}

export default function Header({ hideSearchBox = false }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
        className={`
            fixed top-0 w-full z-50 transition-all backdrop-blur-lg
            ${scrolled 
              ? 'bg-gray-900/95 border-b border-pink-500/30 shadow-lg shadow-pink-500/10' 
              : 'bg-gray-900/70 border-b border-purple-500/20'
            } 
        `}
    >
      <div className="flex gap-2 sm:gap-4 items-center justify-between py-3 sm:py-4 mx-auto px-3 sm:px-6 lg:px-12">
        {/* Logo */}
        <h1 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-purple-500 to-pink-500 whitespace-nowrap flex-shrink-0">
            PromptFlix
        </h1>

        {/* Search (conditionally visible) */}
        <div className={`flex-1 max-w-2xl mx-2 sm:mx-4 transition-all duration-300 ${hideSearchBox ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <SearchBox />
        </div>

        {/* Movie List Button - Hidden on very small screens */}
        {/* <div className="hidden sm:block whitespace-nowrap flex-shrink-0">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-gray-300 border border-amber-500/30 bg-gradient-to-r from-amber-600/80 to-amber-700/80 hover:from-amber-600 hover:to-amber-700 hover:text-white hover:border-amber-500/50 transition-all shadow-md shadow-amber-500/20"
          >
            Movie List
          </Button>
        </div> */}
      </div>
    </header>
  )
}
