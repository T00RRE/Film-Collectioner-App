import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useWindowSize from '../../hooks/useWindowSize';

const Navbar = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { width } = useWindowSize();
  const isMobile = width < 768; // Breakpoint dla urządzeń mobilnych

  // Efekt śledzenia przewijania
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div style={{
      width: '100%', 
      height: '70px', 
      position: 'fixed', 
      top: 0,
      left: 0,
      zIndex: 100,
      transition: 'all 0.3s ease',
      boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.15)' : 'none',
    }}>
      {/* Tło nawigacji */}
      <div style={{
        width: '100%', 
        height: '70px', 
        left: 0, 
        top: 0, 
        position: 'absolute', 
        background: 'linear-gradient(145deg, rgba(25, 25, 30, 0.95) 0%, rgba(35, 35, 40, 0.95) 100%)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(237, 116, 255, 0.3)',
      }} />
      
      {/* Logo */}
      <div style={{
        left: isMobile ? '15px' : '30px', 
        top: 0, 
        height: '70px',
        position: 'absolute', 
        display: 'flex', 
        alignItems: 'center',
        color: '#f0f0f0', 
        fontSize: isMobile ? 20 : 24, 
        fontWeight: '700', 
      }}>
        <span style={{ color: '#ED74FF', marginRight: '8px' }}>🎬</span>
        Film <span style={{ color: '#ED74FF' }}>Collector</span>
      </div>
      
      {/* Przycisk menu mobilnego */}
      {isMobile && (
        <div 
          onClick={toggleMenu}
          style={{
            position: 'absolute',
            right: '15px',
            top: '15px',
            padding: '10px',
            zIndex: 101,
            cursor: 'pointer',
          }}
        >
          <div style={{
            width: '25px',
            height: '3px',
            backgroundColor: '#ED74FF',
            margin: '5px 0',
            transition: 'all 0.3s',
            transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none',
          }}></div>
          <div style={{
            width: '25px',
            height: '3px',
            backgroundColor: '#ED74FF',
            margin: '5px 0',
            transition: 'all 0.3s',
            opacity: menuOpen ? 0 : 1,
          }}></div>
          <div style={{
            width: '25px',
            height: '3px',
            backgroundColor: '#ED74FF',
            margin: '5px 0',
            transition: 'all 0.3s',
            transform: menuOpen ? 'rotate(-45deg) translate(7px, -7px)' : 'none',
          }}></div>
        </div>
      )}
      
      {/* Nawigacja */}
      <div style={{
        right: isMobile ? 0 : '30px',
        top: isMobile ? (menuOpen ? '70px' : '-100%') : 0,
        width: isMobile ? '100%' : 'auto',
        height: isMobile ? 'auto' : '70px',
        position: isMobile ? 'fixed' : 'absolute',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center',
        gap: isMobile ? '0' : '40px',
        background: isMobile ? 'rgba(25, 25, 30, 0.95)' : 'transparent',
        transition: 'all 0.3s ease',
        zIndex: 100,
        backdropFilter: isMobile ? 'blur(10px)' : 'none',
        borderBottom: isMobile ? '1px solid rgba(237, 116, 255, 0.3)' : 'none',
        boxShadow: isMobile ? '0 4px 20px rgba(0,0,0,0.15)' : 'none',
      }}>
        <Link to="/" style={{ 
          textDecoration: 'none',
          width: isMobile ? '100%' : 'auto',
          padding: isMobile ? '15px' : 0,
        }}>
          <div style={{
            color: location.pathname === '/' ? '#ED74FF' : '#f0f0f0', 
            fontSize: 16, 
            fontWeight: location.pathname === '/' ? '700' : '600', 
            padding: isMobile ? '8px 15px' : '8px 16px',
            borderRadius: '20px',
            background: location.pathname === '/' ? 'rgba(237, 116, 255, 0.1)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span style={{ fontSize: '18px' }}>🔍</span>
            Przeglądaj Filmy
          </div>
        </Link>
        
        <Link to="/my-list" style={{ 
          textDecoration: 'none',
          width: isMobile ? '100%' : 'auto',
          padding: isMobile ? '15px' : 0,
        }}>
          <div style={{
            color: location.pathname === '/my-list' ? '#ED74FF' : '#f0f0f0', 
            fontSize: 16, 
            fontWeight: location.pathname === '/my-list' ? '700' : '600', 
            padding: isMobile ? '8px 15px' : '8px 16px',
            borderRadius: '20px',
            background: location.pathname === '/my-list' ? 'rgba(237, 116, 255, 0.1)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span style={{ fontSize: '18px' }}>📋</span>
            Moja Lista
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Navbar;