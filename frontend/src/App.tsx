import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MoviePage from './pages/MoviePage';
import SearchResultsPage from './pages/SearchResults';
import NotFound from './pages/NotFound';

const App = () => {
    return (
        <div className="App">
            <Router>
                <Routes>
                    <Route path='/' element={<HomePage />}></Route>
                    <Route path="/search" element={<SearchResultsPage />} />
                    <Route path='/movies/:id' element={<MoviePage />}></Route>
                    <Route path='/*' element={<NotFound />}></Route>
                </Routes>
            </Router>
        </div>
    );
};

export default App;
