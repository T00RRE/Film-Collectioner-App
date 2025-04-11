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
        <Navbar />
        
        <main className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 15px' }}>
          <Switch>
            <Route exact path="/" component={BrowseMovies} />
            <Route path="/my-list" component={MyList} />
          </Switch>
        </main>
        <footer style={{ 
          background: 'linear-gradient(145deg, rgba(25, 25, 30, 0.98) 0%, rgba(35, 35, 40, 0.98) 100%)',
          color: 'white', 
          padding: '30px 0 20px', 
          marginTop: '50px',
          borderTop: '1px solid rgba(237, 116, 255, 0.3)',
          boxShadow: '0 -5px 20px rgba(0, 0, 0, 0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: '5%',
            right: '5%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(237, 116, 255, 0.5), transparent)',
            zIndex: 1
          }}></div>
          
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 50% 0%, rgba(237, 116, 255, 0.15) 0%, transparent 60%)',
            opacity: 0.7,
            pointerEvents: 'none'
          }}></div>
          
          <div className="container" style={{ 
            maxWidth: '1200px', 
            margin: '0 auto', 
            padding: '0 15px', 
            textAlign: 'center',
            position: 'relative',
            zIndex: 2 
          }}>
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <span style={{ color: '#ED74FF', marginRight: '8px', fontSize: '24px' }}>🎬</span>
              <span style={{ fontSize: '20px', fontWeight: '700' }}>
                Film <span style={{ color: '#ED74FF' }}>Collector</span>
              </span>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '20px', 
              marginBottom: '25px',
              flexWrap: 'wrap' 
            }}>
              <Link to="/" style={{ 
                color: '#f0f0f0', 
                textDecoration: 'none',
                padding: '5px 10px',
                borderRadius: '15px',
                transition: 'all 0.2s ease',
                fontSize: '15px'
              }} onMouseOver={(e) => {e.currentTarget.style.color = '#ED74FF'}} 
                 onMouseOut={(e) => {e.currentTarget.style.color = '#f0f0f0'}}>
                Przeglądaj Filmy
              </Link>
              <Link to="/my-list" style={{ 
                color: '#f0f0f0', 
                textDecoration: 'none',
                padding: '5px 10px',
                borderRadius: '15px',
                transition: 'all 0.2s ease',
                fontSize: '15px'
              }} onMouseOver={(e) => {e.currentTarget.style.color = '#ED74FF'}} 
                 onMouseOut={(e) => {e.currentTarget.style.color = '#f0f0f0'}}>
                Moja Lista
              </Link>
              <a href="#" style={{ 
                color: '#f0f0f0', 
                textDecoration: 'none',
                padding: '5px 10px',
                borderRadius: '15px',
                transition: 'all 0.2s ease',
                fontSize: '15px'
              }} onMouseOver={(e) => {e.currentTarget.style.color = '#ED74FF'}} 
                 onMouseOut={(e) => {e.currentTarget.style.color = '#f0f0f0'}}>
                O Aplikacji
              </a>
              <a href="#" style={{ 
                color: '#f0f0f0', 
                textDecoration: 'none',
                padding: '5px 10px',
                borderRadius: '15px',
                transition: 'all 0.2s ease',
                fontSize: '15px'
              }} onMouseOver={(e) => {e.currentTarget.style.color = '#ED74FF'}} 
                 onMouseOut={(e) => {e.currentTarget.style.color = '#f0f0f0'}}>
                Kontakt
              </a>
            </div>
            
            <div style={{ 
              padding: '15px 0', 
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.6)'
            }}>
              <p style={{ margin: '0 0 8px 0' }}>&copy; {new Date().getFullYear()} Kolekcjoner Filmów. Wszystkie prawa zastrzeżone.</p>
              <p style={{ margin: '0', fontSize: '13px' }}>Korzystamy z API OMDb do pozyskiwania danych o filmach.</p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;