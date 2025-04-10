import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div style={{ textAlign: 'center', padding: '3rem 0' }}>
      <h1 style={{ fontSize: '3.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Strona nie została znaleziona</h2>
      <p style={{ color: '#4b5563', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
        Przepraszamy, ale strona, której szukasz, nie istnieje lub została przeniesiona.
      </p>
      <Link
        to="/"
        style={{
          backgroundColor: '#2563eb',
          color: 'white',
          padding: '0.5rem 1.5rem',
          borderRadius: '0.375rem',
          textDecoration: 'none',
        }}
      >
        Wróć do strony głównej
      </Link>
    </div>
  );
};

export default NotFound;