import logo from './logo.svg';
import './App.css';
import { Component1 } from './components/Component1';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <Component1/>
      </header>
    </div>
  );
}

export default App;
