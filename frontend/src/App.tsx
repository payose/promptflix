import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MoviePage from './pages/MoviePage';
import SearchResultsPage from './pages/SearchResults';
import NotFound from './pages/NotFound';
import MovieModalPage from './pages/MovieModalPage';
import { Toaster } from './components/ui/sonner';

function App() {
    return (
        <div className="App">
            <Router>
                <AppRoutes />
            </Router>
            <Toaster richColors position="top-center" />
        </div>
    );
}

function AppRoutes() {
    const location = useLocation();
    const state = location.state as { backgroundLocation?: Location };
    const backgroundLocation = state?.backgroundLocation;

    return (
        <>
            <Routes location={backgroundLocation || location}>
                <Route path='/' element={<HomePage />} />
                <Route path="/search" element={<SearchResultsPage />} />
                <Route path='/movies/:id' element={<MoviePage />} />
                <Route path='/*' element={<NotFound />} />
            </Routes>

            {backgroundLocation && (
                <Routes>
                    <Route path='/movies/:id' element={<MovieModalPage />} />
                </Routes>
            )}
        </>
    );
}

export default App;
