import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import BrowseMovies from './pages/BrowseMovies';
import MyList from './pages/MyList';
import './App.css';
import Navbar from './components/layout/Navbar';

function App() {
  return (
    <Router>
      <div className="App">
        {/* Zamień istniejący header na nowy komponent Navbar */}
        <Navbar />
        
        <main className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 15px' }}>
          <Switch>
            <Route exact path="/" component={BrowseMovies} />
            <Route path="/my-list" component={MyList} />
          </Switch>
        </main>
        <footer style={{ backgroundColor: '#343a40', color: 'white', padding: '20px 0', marginTop: 'auto' }}>
          <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 15px', textAlign: 'center' }}>
            <p>&copy; {new Date().getFullYear()} Kolekcjoner Filmów</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;