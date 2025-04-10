import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Kolekcjoner Filmów</h3>
            <p style={{ color: '#9ca3af' }}>Twoja osobista filmoteka</p>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <p>&copy; {new Date().getFullYear()} Kolekcjoner Filmów</p>
            <p style={{ color: '#9ca3af' }}>Projekt edukacyjny</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;