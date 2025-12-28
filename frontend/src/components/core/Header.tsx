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
        role="banner"
        className={`
            fixed top-0 w-full z-50 transition-all
            ${scrolled
              ? 'bg-black/80 backdrop-blur-md border-b border-zinc-800'
              : 'bg-transparent border-b border-zinc-900'
            }
        `}
    >
      <nav
        className="flex gap-2 sm:gap-4 items-center justify-between py-3 sm:py-4 mx-auto px-3 sm:px-6 lg:px-12"
        aria-label="Main navigation"
      >
        {/* Logo - clickable home link */}
        <a
          href="/"
          className="whitespace-nowrap flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-amber-500/50 rounded"
          aria-label="FindsMovies home"
        >
          <h1 className="inline text-xl sm:text-2xl font-semibold tracking-wide text-white">
            finds<span className="text-amber-500">movies</span>
          </h1>
        </a>

        {/* Search (conditionally visible) */}
        <div
          className={`flex-1 max-w-2xl mx-2 sm:mx-4 transition-all duration-300 ${hideSearchBox ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          aria-hidden={hideSearchBox}
        >
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
      </nav>
    </header>
  )
}
