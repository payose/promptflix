import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import HomePage from './pages/HomePage';
import MoviePage from './pages/MoviePage';

const App = () => {
    return (
        <div className="App">
            <Router>
                <Routes>
                    <Route path='/' element={<HomePage />}></Route>
                    <Route path='/movies/:id' element={<MoviePage />}></Route>
                </Routes>
            </Router>
        </div>
    );
};

export default App;
