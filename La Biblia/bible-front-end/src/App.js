import './App.css';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import BibleHome from './components/BibleHome';
import Chapter from './components/Chapter';
import BookIndex from './components/BookIndex';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" Component={BibleHome}/>
        <Route path="/:testament/:bookIndex" Component={BookIndex}/>
        <Route path="/:chapter/:index" Component={Chapter}/>
      </Routes>
    </Router>
  );
}

export default App;
