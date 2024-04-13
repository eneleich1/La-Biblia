import './App.css';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import BibleHome from './components/BibleHome';
import BookIndex from './components/BookIndex';
import Chapter from './components/Chapter';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" Component={BibleHome}/>
        <Route path="/:testament/:bookIndex" Component={BookIndex}/>
        <Route path="/:testament/:bookIndex/:bookName/:chapterNumber" Component={Chapter}/>
      </Routes>
    </Router>
  );
}

export default App;
