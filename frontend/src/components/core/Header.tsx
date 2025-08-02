import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import SearchBox from '@/components/core/SearchBox';

export default function Header() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 200)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
        className={`
            fixed top-0 w-full z-50 border-b border-white/10 transition-all
            ${scrolled ? 'bg-gray-900' : 'bg-gray-900/10'} 
        `}
    >
      <div className="flex gap-6 items-center justify-between h-16 mx-auto px-4 sm:px-6 lg:px-24">
        {/* Logo */}
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-pink-600">
            PromptFlix
        </h1>

        {/* Search (visible only when scrolled) */}
        <div className="flex-1 px-20">
            {scrolled && (
            <div className="transition-opacity duration-500 ease-in-out">
                <SearchBox />
            </div>
            )}
        </div>
        

        {/* Movie List Button */}
        <div>
          <Button variant="ghost" className="text-gray-300 border-none bg-pink-600 hover:text-white">
            Movie List
          </Button>
        </div>
      </div>
    </header>
  )
}
