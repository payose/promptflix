import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Home } from 'lucide-react';

function NotFound() {
    const [glitch, setGlitch] = useState(false);
    const [screenGlitch, setScreenGlitch] = useState(false);
    const [textGlitch, setTextGlitch] = useState(false);

    // 404 glitch effect - frequent and intense
    useEffect(() => {
        const glitchInterval = setInterval(() => {
            setGlitch(true);
            setTimeout(() => setGlitch(false), 200);
        }, 2000);

        return () => clearInterval(glitchInterval);
    }, []);

    // Screen-wide glitch effect
    useEffect(() => {
        const screenGlitchInterval = setInterval(() => {
            setScreenGlitch(true);
            setTimeout(() => setScreenGlitch(false), 150);
        }, 3500);

        return () => clearInterval(screenGlitchInterval);
    }, []);

    // Text flicker effect
    useEffect(() => {
        const textFlickerInterval = setInterval(() => {
            setTextGlitch(true);
            setTimeout(() => setTextGlitch(false), 100);
        }, 1500);

        return () => clearInterval(textFlickerInterval);
    }, []);

    return (
        <>
            <div className={`relative w-screen h-screen bg-black overflow-hidden ${screenGlitch ? 'screen-glitch' : ''}`}>
                {/* Subtle grid background with flicker */}
                <div className={`absolute inset-0 opacity-5 pointer-events-none bg-[linear-gradient(to_right,#52525b_1px,transparent_1px),linear-gradient(to_bottom,#52525b_1px,transparent_1px)] bg-[size:40px_40px] ${screenGlitch ? 'opacity-20' : ''} transition-opacity`} />

                {/* Scanline effect */}
                <div className="absolute inset-0 pointer-events-none opacity-10 bg-gradient-to-b from-transparent via-amber-500/10 to-transparent animate-scanline" />

                <main id="main-content" className="relative flex flex-col items-center justify-center min-h-screen px-6" role="main">
                    {/* 404 with strong glitch */}
                    <div className="relative mb-12">
                        <h1
                            className={`text-9xl font-light text-white tracking-tight ${
                                glitch ? 'glitch-active' : ''
                            }`}
                            data-text="404"
                        >
                            404
                        </h1>
                    </div>

                    {/* Matrix-style cryptic messages */}
                    <div className={`text-center mb-16 space-y-4 ${textGlitch ? 'opacity-50' : 'opacity-100'} transition-opacity`}>
                        <p className="text-zinc-500 text-base font-mono">
                            &gt; path_not_found: void reference detected
                        </p>
                        <p className="text-zinc-700 text-sm font-mono">
                            // The construct has no memory of this location
                        </p>
                    </div>

                    {/* Action button */}
                    <div className="flex items-center">
                        <Link
                            to="/"
                            className={`group px-10 py-4 bg-amber-500 hover:bg-amber-600 text-black rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
                                textGlitch ? 'button-flicker' : ''
                            }`}
                            aria-label="Return to homepage"
                        >
                            <div className="flex items-center gap-3">
                                <Home className="w-5 h-5" />
                                <span className="font-mono">RETURN</span>
                            </div>
                        </Link>
                    </div>

                    {/* Matrix-style hint */}
                    <p className={`mt-16 text-xs text-zinc-800 font-mono ${textGlitch ? 'opacity-0' : 'opacity-100'} transition-opacity`}>
                        &gt; wake_up.exe
                    </p>
                </main>

                {/* CSS for glitch effects */}
                <style>{`
                    /* Scanline animation */
                    @keyframes scanline {
                        0% { transform: translateY(-100%); }
                        100% { transform: translateY(100%); }
                    }

                    .animate-scanline {
                        animation: scanline 8s linear infinite;
                    }

                    /* Screen-wide glitch */
                    .screen-glitch {
                        animation: screen-shake 0.15s ease-in-out;
                    }

                    @keyframes screen-shake {
                        0%, 100% {
                            transform: translate(0, 0);
                        }
                        10% {
                            transform: translate(-5px, 2px);
                        }
                        20% {
                            transform: translate(5px, -2px);
                        }
                        30% {
                            transform: translate(-3px, -3px);
                        }
                        40% {
                            transform: translate(3px, 3px);
                        }
                        50% {
                            transform: translate(-2px, -1px);
                        }
                        60% {
                            transform: translate(2px, 1px);
                        }
                        70% {
                            transform: translate(-1px, -2px);
                        }
                        80% {
                            transform: translate(1px, 2px);
                        }
                        90% {
                            transform: translate(-1px, 1px);
                        }
                    }

                    /* 404 text glitch */
                    .glitch-active {
                        position: relative;
                        animation: glitch-skew 0.2s ease-in-out;
                    }

                    @keyframes glitch-skew {
                        0% {
                            transform: skew(0deg);
                        }
                        20% {
                            transform: skew(-3deg) translate(-10px, 0);
                        }
                        40% {
                            transform: skew(3deg) translate(10px, 0);
                        }
                        60% {
                            transform: skew(-2deg) translate(-5px, 0);
                        }
                        80% {
                            transform: skew(2deg) translate(5px, 0);
                        }
                        100% {
                            transform: skew(0deg);
                        }
                    }

                    .glitch-active::before,
                    .glitch-active::after {
                        content: attr(data-text);
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        opacity: 0.9;
                    }

                    .glitch-active::before {
                        left: -5px;
                        color: #f59e0b;
                        text-shadow: 3px 0 #f59e0b;
                        animation: glitch-before 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
                    }

                    .glitch-active::after {
                        left: 5px;
                        color: #3b82f6;
                        text-shadow: -3px 0 #3b82f6;
                        animation: glitch-after 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
                    }

                    @keyframes glitch-before {
                        0%, 100% {
                            transform: translateX(0);
                        }
                        20%, 60% {
                            transform: translateX(-12px);
                        }
                        40%, 80% {
                            transform: translateX(12px);
                        }
                    }

                    @keyframes glitch-after {
                        0%, 100% {
                            transform: translateX(0);
                        }
                        20%, 60% {
                            transform: translateX(12px);
                        }
                        40%, 80% {
                            transform: translateX(-12px);
                        }
                    }

                    /* Button flicker */
                    .button-flicker {
                        animation: flicker 0.1s ease-in-out;
                    }

                    @keyframes flicker {
                        0%, 100% {
                            opacity: 1;
                        }
                        50% {
                            opacity: 0.3;
                        }
                    }
                `}</style>
            </div>
        </>
    );
}

export default NotFound;
