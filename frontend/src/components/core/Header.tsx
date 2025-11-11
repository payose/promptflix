import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import SearchBox from '@/components/core/SearchBox';

export default function Header() {
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
            fixed top-0 w-full z-50 border-b border-purple-500/20 transition-all backdrop-blur-md
            ${scrolled ? 'bg-gray-900/95' : 'bg-gray-900/60'} 
        `}
    >
      <div className="flex gap-4 items-center justify-between py-4 mx-auto px-4 sm:px-6 lg:px-12">
        {/* Logo */}
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 whitespace-nowrap">
            PromptFlix
        </h1>

        {/* Search (always visible) */}
        <div className="flex-1 max-w-2xl mx-4">
            <SearchBox />
        </div>

        {/* Movie List Button */}
        <div className="whitespace-nowrap">
          <Button variant="ghost" className="text-gray-300 border-none bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 hover:text-white">
            Movie List
          </Button>
        </div>
      </div>
    </header>
  )
}
