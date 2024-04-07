import './App.css';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import BibleHome from './components/BibleHome';
import BookIndex from './components/BookIndex';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" Component={BibleHome}/>
        <Route path="/:testament/:bookIndex" Component={BookIndex}/>
      </Routes>
    </Router>
  );
}

export default App;
