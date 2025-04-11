import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api, { omdbApi } from '../services/api';
import useWindowSize from '../hooks/useWindowSize';
function BrowseMovies() {
  const [searchTerm, setSearchTerm] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Stany dla polecanych filmów
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [loadingRecommended, setLoadingRecommended] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedMovie, setSelectedMovie] = useState(null);


  const { width } = useWindowSize();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const slidesToShow = isMobile ? 1 : isTablet ? 2 : 4;
  const slidesToScroll = 1;
  useEffect(() => {
    fetchRecommendedMovies();
  }, []);

  const fetchRecommendedMovies = async () => {
    try {
      setLoadingRecommended(true);
      const response = await api.get('/omdb/recommended?limit=10');
      setRecommendedMovies(response.data);
    } catch (err) {
      console.error('Błąd pobierania polecanych filmów:', err);
    } finally {
      setLoadingRecommended(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(
        `/omdb/search?title=${encodeURIComponent(searchTerm)}`
      );
      
      if (response.data.Search) {
        setMovies(response.data.Search);
      } else {
        setMovies([]);
        setError(response.data.Error || 'Nie znaleziono filmów');
      }
    } catch (err) {
      console.error('Błąd wyszukiwania:', err);
      setError('Wystąpił błąd podczas wyszukiwania. Spróbuj ponownie.');
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const addToMyList = async (movie, watched = false) => {
    try {
      // Konwersja danych z formatu OMDB na nasz model
      const movieData = {
        imdbId: movie.imdbID,
        title: movie.Title,
        year: parseInt(movie.Year) || null,
        poster: movie.Poster || "",
        watched: Boolean(watched),
        // Dla PostgreSQL
        actors: movie.Actors ? movie.Actors.split(', ') : [],
        genre: movie.Genre ? movie.Genre.split(', ') : []
      };

      console.log('Wysyłane dane:', JSON.stringify(movieData));

      // Wywołanie API do dodania filmu
      await api.post('/movies', movieData);
      alert(`Film "${movie.Title}" został dodany do Twojej kolekcji jako ${watched ? 'obejrzany' : 'do obejrzenia'}`);
    } catch (err) {
      console.error('Błąd dodawania filmu:', err);
      if (err.response && err.response.status === 400) {
        alert('Ten film już istnieje w Twojej kolekcji.');
      } else {
        alert('Wystąpił błąd podczas dodawania filmu.');
      }
    }
  };

  const showMovieDetails = async (movie) => {
    try {
      setLoading(true);
      const response = await api.get(`/omdb/detail/${movie.imdbID}`);
      setSelectedMovie(response.data);
    } catch (err) {
      console.error('Błąd pobierania szczegółów filmu:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const closeMovieDetails = () => {
    setSelectedMovie(null);
  };

  // Obsługa slidera


  const nextSlide = () => {
    setCurrentSlide((prev) => {
      const maxSlide = Math.max(0, Math.ceil((recommendedMovies.length - slidesToShow) / slidesToScroll));
      return prev >= maxSlide ? 0 : prev + 1;
    });
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => {
      const maxSlide = Math.max(0, Math.ceil((recommendedMovies.length - slidesToShow) / slidesToScroll));
      return prev <= 0 ? maxSlide : prev - 1;
    });
  };

  // Funkcja do pobierania koloru gradientu dla każdego polecanego filmu
  const getRandomGradient = (index) => {
    const gradients = [
      'linear-gradient(145deg, rgba(237, 116, 255, 0.3) 0%, rgba(180, 60, 200, 0.4) 100%)',
      'linear-gradient(145deg, rgba(116, 165, 255, 0.3) 0%, rgba(60, 120, 200, 0.4) 100%)',
      'linear-gradient(145deg, rgba(255, 116, 161, 0.3) 0%, rgba(200, 60, 110, 0.4) 100%)',
      'linear-gradient(145deg, rgba(116, 255, 177, 0.3) 0%, rgba(60, 200, 130, 0.4) 100%)',
      'linear-gradient(145deg, rgba(255, 200, 116, 0.3) 0%, rgba(200, 150, 60, 0.4) 100%)'
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div>
      <h2 style={{ 
        fontSize: '28px', 
        fontWeight: 'bold',
        marginTop: '125px',
        marginBottom: '25px', 
        color: '#f0f0f0', 
        textAlign: 'center',
        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
      }}>
        Przeglądaj Filmy
      </h2>
      
      {/* Slider z polecanymi filmami */}
      <div style={{ marginBottom: '40px', width: '90%', margin: '0 auto' }}>
        <h3 style={{ 
          fontSize: '22px', 
          marginBottom: '20px', 
          color: '#ED74FF',
          fontWeight: 'bold',
          textAlign: 'center',
          textShadow: '0 1px 3px rgba(0,0,0,0.3)'
        }}>
          Polecane Filmy
        </h3>
        
        {loadingRecommended ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 0',
            color: '#ED74FF',
            fontSize: '18px'
          }}>
            <p>Ładowanie polecanych filmów...</p>
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            {/* Przyciski przewijania */}
            <button 
              onClick={prevSlide}
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10,
                background: 'linear-gradient(145deg, rgba(237, 116, 255, 0.5) 0%, rgba(180, 80, 200, 0.6) 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '24px',
                fontWeight: 'bold',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                e.currentTarget.style.boxShadow = '0 6px 15px rgba(0, 0, 0, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(-50%)';
                e.currentTarget.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.3)';
              }}
            >
              ◀
            </button>
            
            <div style={{
              display: 'flex',
              overflowX: 'hidden',
              padding: isMobile ? '15px 15px' : '15px 60px',
              scrollBehavior: 'smooth',
              position: 'relative'
            }}>
              <div style={{
                display: 'flex',
                transform: `translateX(-${currentSlide * (100 / slidesToShow)}%)`,
                transition: 'transform 0.5s ease',
                gap: isMobile ? '20px' : '20px',
                width: `${recommendedMovies.length * (100 / slidesToShow)}%`,
                alignItems: 'center',
                justifyContent: isMobile ? 'center' : 'flex-start',
              }}>
                {recommendedMovies.map((movie, index) => (
                  <div key={movie.imdbID} style={{
                    flex: `0 0 ${isMobile ? '100%' : isTablet ? '33.33%' : '20%'}`,
                    boxSizing: 'border-box',
                    padding: '0 5px',
                    minWidth: isMobile ? '240px' : '180px',
                    maxWidth: isMobile ? '320px' : '280px',
                    margin: isMobile ? '0 auto' : '0',
                  }}>
                    <div style={{
                      background: getRandomGradient(index),
                      borderRadius: '16px',
                      overflow: 'hidden',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15), 0 3px 6px rgba(0, 0, 0, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      transition: 'all 0.3s ease',
                      transform: 'translateZ(0)',
                      position: 'relative'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px) translateZ(0)';
                      e.currentTarget.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.2), 0 5px 10px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateZ(0)';
                      e.currentTarget.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.15), 0 3px 6px rgba(0, 0, 0, 0.1)';
                    }}
                    >
                      {/* Efekt blasku na górze karty */}
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: '5%',
                        right: '5%',
                        height: '1px',
                        background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent)',
                        zIndex: 1
                      }}></div>
                      
                      <div style={{ 
                        position: 'relative',
                        height: isMobile ? '240px' : '280px',
                        overflow: 'hidden',
                        borderTopLeftRadius: '16px',
                        borderTopRightRadius: '16px'
                      }}>
                        {movie.Poster && movie.Poster !== 'N/A' ? (
                          <img 
                            src={movie.Poster} 
                            alt={`Plakat filmu ${movie.Title}`} 
                            style={{ 
                              width:'100%', 
                              height: '100%', 
                              objectFit: 'cover',
                              objectPosition: 'center top',
                              transition: 'transform 0.5s ease',
                              imageRendering: 'auto'
                            }}
                            onMouseOver={(e) => {e.currentTarget.style.transform = 'scale(1.05)'}}
                            onMouseOut={(e) => {e.currentTarget.style.transform = 'scale(1)'}}
                          />
                        ) : (
                          <div style={{ 
                            width: '100%', 
                            height: '100%', 
                            background: 'linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ED74FF',
                            fontWeight: 'bold'
                          }}>
                            <div style={{
                              textAlign: 'center',
                              padding: '10px'
                            }}>
                              <span style={{
                                display: 'block',
                                fontSize: '32px',
                                marginBottom: '10px'
                              }}>🎬</span>
                              Brak plakatu
                            </div>
                          </div>
                        )}
                        
                        {/* Gradient overlay na plakacie */}
                        <div style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: '50%',
                          background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
                          pointerEvents: 'none'
                        }}></div>
                        
                        {/* Rok produkcji na plakacie */}
                        <div style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          backgroundColor: 'rgba(0, 0, 0, 0.6)',
                          color: 'white',
                          padding: '5px 10px',
                          borderRadius: '12px',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                        }}>
                          {movie.Year}
                        </div>
                      </div>
                      
                      <div style={{ 
                        padding: '15px', 
                        flex: 1, 
                        display: 'flex', 
                        flexDirection: 'column',
                        position: 'relative',
                        zIndex: 2,
                        background: 'rgba(35, 35, 40, 0.8)',
                        backdropFilter: 'blur(5px)'
                      }}>
                        <h4 style={{ 
                          margin: '0 0 8px 0', 
                          fontSize: '16px',
                          fontWeight: 'bold',
                          color: 'white',
                          textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                          lineHeight: '1.4',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          height: '44px'
                        }}>
                          {movie.Title}
                        </h4>
                        
                        <div style={{ marginTop: 'auto', display: 'flex', gap: '8px', marginTop: '12px' }}>
                          <button
                            onClick={() => showMovieDetails(movie)}
                            style={{
                              flex: 1,
                              background: 'linear-gradient(145deg, #ed74ff 0%, #da4eea 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '10px',
                              padding: '8px 12px',
                              cursor: 'pointer',
                              fontSize: '13px',
                              fontWeight: 'bold',
                              boxShadow: '0 4px 8px rgba(237, 116, 255, 0.3)',
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '5px'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 6px 12px rgba(237, 116, 255, 0.4)';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 4px 8px rgba(237, 116, 255, 0.3)';
                            }}
                          >
                            <span style={{ fontSize: '16px' }}>ℹ️</span>
                            Zobacz
                          </button>
                          <button
                            onClick={() => addToMyList(movie, false)}
                            style={{
                              flex: 1,
                              background: 'linear-gradient(145deg, #28a745 0%, #218838 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '10px',
                              padding: '8px 12px',
                              cursor: 'pointer',
                              fontSize: '13px',
                              fontWeight: 'bold',
                              boxShadow: '0 4px 8px rgba(40, 167, 69, 0.3)',
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '5px'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 6px 12px rgba(40, 167, 69, 0.4)';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 4px 8px rgba(40, 167, 69, 0.3)';
                            }}
                          >
                            <span style={{ fontSize: '16px' }}>📋</span>
                            Dodaj
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <button 
              onClick={nextSlide}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10,
                background: 'linear-gradient(145deg, rgba(237, 116, 255, 0.5) 0%, rgba(180, 80, 200, 0.6) 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '24px',
                fontWeight: 'bold',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                e.currentTarget.style.boxShadow = '0 6px 15px rgba(0, 0, 0, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(-50%)';
                e.currentTarget.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.3)';
              }}
            >
              ▶
            </button>
            
            {/* Wskaźniki slidera (kropki) */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '20px',
              flexWrap: 'wrap'
            }}>
              {Array.from({ length: Math.min(Math.max(1, Math.ceil((recommendedMovies.length - slidesToShow) / slidesToScroll)) + 1, 5) }).map((_, index) => (
    <button
      key={index}
      onClick={() => setCurrentSlide(index)}
      style={{
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        backgroundColor: currentSlide === index ? '#ED74FF' : 'rgba(255, 255, 255, 0.3)',
        border: 'none',
        padding: 0,
        margin: 0,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: currentSlide === index ? '0 0 5px #ED74FF' : 'none'
      }}
    />
  ))}
</div>
          </div>
        )}
      </div>
      
      {/* Wyszukiwarka filmów */}
      <form onSubmit={handleSearch} style={{ marginBottom: '40px' }}>
        <div style={{ 
          maxWidth: isMobile ? '90%' : '600px',
          margin: '0 auto 25px auto',
          display: 'flex',
          alignItems: 'center',
          background: 'linear-gradient(145deg, rgba(65, 45, 70, 0.4) 0%, rgba(35, 35, 40, 0.5) 100%)',
          borderRadius: '30px',
          padding: '6px 8px 6px 20px',
          boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
          border: '1px solid rgba(237, 116, 255, 0.4)',
          backdropFilter: 'blur(5px)'
        }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Wpisz tytuł filmu..."
            style={{
              flex: '1',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              padding: '12px 5px',
              fontSize: '16px',
              color: 'white',
              fontFamily: 'Inter, Arial, sans-serif'
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading 
                ? 'rgba(237, 116, 255, 0.3)' 
                : 'linear-gradient(145deg, #ed74ff 0%, #da4eea 100%)',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              padding: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
              transition: 'all 0.2s ease',
              margin: '0 5px'
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.3)';
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
              }
            }}
          >
            {loading ? (
              <span style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>...</span>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            )}
          </button>
        </div>
      </form>

      {/* Obsługa błędów */}
      {error && (
        <div style={{
          backgroundColor: 'rgba(220, 53, 69, 0.1)',
          border: '1px solid rgba(220, 53, 69, 0.3)',
          color: '#dc3545',
          padding: '15px 20px',
          borderRadius: '12px',
          marginBottom: '30px',
          maxWidth: '800px',
          margin: '0 auto 30px auto',
          textAlign: 'center',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
        }}>
          {error}
        </div>
      )}

      {/* Wyniki wyszukiwania */}
      {movies.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', maxWidth: '974px', margin: '0 auto' }}>
          {movies.map((movie) => (
            <div key={movie.imdbID} style={{
              width: isMobile? '90%' : '90%',
              background: 'linear-gradient(145deg, rgba(65, 45, 70, 0.6) 0%, rgba(35, 35, 40, 0.7) 100%)',
              borderRadius: '24px',
              border: '1px solid rgba(237, 116, 255, 0.7)',
              padding: '24px',
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
  padding: isMobile ? '15px' : '24px',
              overflow: 'hidden',
              marginBottom: '20px',
              boxShadow: '0 15px 25px rgba(0, 0, 0, 0.2), 0 5px 10px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)',
              position: 'relative',
              transform: 'translateZ(0)' // Aktywuje GPU dla płynniejszych animacji
            }}>
              {/* Stylizowana krawędź górna */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: '5%',
                right: '5%',
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(237, 116, 255, 0.5), transparent)',
                zIndex: 1
              }}></div>
              
              {/* Efekt świecenia */}
              <div style={{
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                right: '-50%',
                bottom: '-50%',
                background: 'radial-gradient(circle at 50% 50%, rgba(237, 116, 255, 0.1) 0%, transparent 70%)',
                opacity: 0.7,
                pointerEvents: 'none'
              }}></div>
              
              <div style={{ 
                width: '140px', 
                height: '210px', 
                flexShrink: 0,
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 8px 15px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                position: 'relative'
              }}>
                <img 
                  src={movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/140x210?text=Brak+plakatu'} 
                  alt={`Plakat filmu ${movie.Title}`}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    transition: 'transform 0.5s ease'
                  }}
                  onMouseOver={(e) => {e.currentTarget.style.transform = 'scale(1.08)'}}
                  onMouseOut={(e) => {e.currentTarget.style.transform = 'scale(1)'}}
                />
                
                {/* Delikatny gradientowy overlay na plakacie */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '40%',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
                  pointerEvents: 'none',
                  opacity: 0.8
                }}></div>
              </div>
              
              <div style={{ 
                flex: 1, 
                padding: '0 0 0 25px', 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <h3 style={{ 
                    margin: '0 0 15px 0', 
                    fontSize: '24px', 
                    color: '#ffffff',
                    fontWeight: 'bold',
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                    letterSpacing: '0.3px'
                  }}>
                    {movie.Title}
                  </h3>
                  
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '12px', 
                    marginBottom: '18px'
                  }}>
                    {movie.Year && (
                      <span style={{ 
                        backgroundColor: 'rgba(237, 116, 255, 0.15)', 
                        padding: '7px 14px', 
                        borderRadius: '20px', 
                        fontSize: '14px', 
                        color: '#ED74FF',
                        fontWeight: 'bold',
                        border: '1px solid rgba(237, 116, 255, 0.3)',
                        boxShadow: '0 3px 6px rgba(0,0,0,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {movie.Year}
                      </span>
                    )}
                    {movie.Type && (
                      <span style={{ 
                        backgroundColor: 'rgba(23, 162, 184, 0.15)', 
                        padding: '7px 14px', 
                        borderRadius: '20px', 
                        fontSize: '14px', 
                        color: '#17A2B8',
                        fontWeight: 'bold',
                        border: '1px solid rgba(23, 162, 184, 0.3)',
                        boxShadow: '0 3px 6px rgba(0,0,0,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}>
                        <span style={{ fontSize: '16px' }}>
                          {movie.Type === 'movie' ? '🎬' : movie.Type === 'series' ? '📺' : '📅'}
                        </span>
                        {movie.Type.charAt(0).toUpperCase() + movie.Type.slice(1)}
                      </span>
                    )}
                  </div>
                  
                  <div style={{ 
                    marginBottom: '18px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    padding: '12px 18px',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1), 0 2px 5px rgba(0,0,0,0.05)'
                  }}>
                    <p style={{ 
                      margin: '0', 
                      color: '#f0f0f0', 
                      fontSize: '15px',
                      lineHeight: '1.5'
                    }}>
                      Kliknij "Zobacz więcej", aby poznać szczegóły filmu lub dodaj film do swojej kolekcji.
                    </p>
                  </div>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  gap: '12px',
                  flexWrap: 'wrap',
                  marginTop: '5px'
                }}>
                  <button
                    onClick={() => showMovieDetails(movie)}
                    style={{
                      background: 'linear-gradient(145deg, #ed74ff 0%, #da4eea 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '10px 16px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 8px rgba(237, 116, 255, 0.4)',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 12px rgba(237, 116, 255, 0.5)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(237, 116, 255, 0.4)';
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>ℹ️</span>
                    Zobacz więcej
                  </button>
                  <button
                    onClick={() => addToMyList(movie, false)}
                    style={{
                      background: 'linear-gradient(145deg, #28a745 0%, #218838 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '10px 16px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 8px rgba(40, 167, 69, 0.4)',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 12px rgba(40, 167, 69, 0.5)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(40, 167, 69, 0.4)';
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>📋</span>
                    Do obejrzenia
                  </button>
                  <button
                    onClick={() => addToMyList(movie, true)}
                    style={{
                      background: 'linear-gradient(145deg, #007bff 0%, #0069d9 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '10px 16px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 8px rgba(0, 123, 255, 0.4)',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 123, 255, 0.5)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 123, 255, 0.4)';
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>✓</span>
                    Obejrzane
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !loading && (
          <div style={{ 
            textAlign: 'center', 
            color: '#9e9e9e', 
            padding: '60px 0',
            background: 'linear-gradient(145deg, rgba(65, 45, 70, 0.3) 0%, rgba(35, 35, 40, 0.4) 100%)',
            borderRadius: '20px',
            maxWidth: '650px',
            margin: '0 auto',
            border: '1px dashed rgba(237, 116, 255, 0.4)',
            boxShadow: 'inset 0 0 30px rgba(0,0,0,0.2)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Dekoracyjny element */}
            <div style={{
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              right: '-50%',
              bottom: '-50%',
              background: 'radial-gradient(circle at 50% 50%, rgba(237, 116, 255, 0.05) 0%, transparent 70%)',
              opacity: 0.7,
              pointerEvents: 'none'
            }}></div>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              zIndex: 1
            }}>
              <span style={{
                fontSize: '48px',
                marginBottom: '20px',
                opacity: 0.8
              }}>
                🔍
              </span>
              <p style={{ 
                fontSize: '20px',
                fontWeight: 'bold',
                marginBottom: '10px',
                color: '#b0b0b0'
              }}>
                Wyszukaj film, aby zobaczyć wyniki
              </p>
              <p style={{ 
                fontSize: '16px',
                maxWidth: '400px',
                margin: '0 auto',
                lineHeight: '1.5'
              }}>
                Wpisz tytuł filmu w polu wyszukiwania powyżej lub przeglądaj polecane filmy.
              </p>
            </div>
          </div>
        )
      )}

      {/* Loading indicator */}
      {loading && !selectedMovie && (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 0',
          color: '#ED74FF',
          fontSize: '18px'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '15px'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: '3px solid rgba(237, 116, 255, 0.3)',
              borderTop: '3px solid #ED74FF',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}></div>
            <p>Wyszukiwanie filmów...</p>
          </div>
          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
        </div>
      )}

      {/* Modal ze szczegółami filmu */}
      {selectedMovie && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(5px)'
        }}>
          <div style={{
            width: '80%',
            maxWidth: '800px',
            background: 'linear-gradient(135deg, rgba(40, 40, 40, 0.95) 0%, rgba(20, 20, 20, 0.95) 100%)',
            borderRadius: '16px',
            padding: '25px',
            border: '1px solid rgba(237, 116, 255, 0.6)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(237, 116, 255, 0.2)',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', marginBottom: '20px', flexWrap: 'wrap' }}>
              {selectedMovie.Poster && selectedMovie.Poster !== 'N/A' ? (
                <div style={{
                  width: '220px',
                  flexShrink: 0,
                  marginRight: '25px',
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.4)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '2px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <img 
                    src={selectedMovie.Poster} 
                    alt={`Plakat filmu ${selectedMovie.Title}`} 
                    style={{ 
                      width: '100%', 
                      height: 'auto', 
                      display: 'block'
                    }}
                  />
                </div>
              ) : (
                <div style={{ 
                  width: '220px', 
                  height: '330px', 
                  backgroundColor: '#333',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ED74FF',
                  marginRight: '25px',
                  border: '2px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.4)'
                }}>
                  <div style={{
                    textAlign: 'center',
                    padding: '10px'
                  }}>
                    <span style={{
                      display: 'block',
                      fontSize: '32px',
                      marginBottom: '10px'
                    }}>🎬</span>
                    Brak plakatu
                  </div>
                </div>
              )}
              
              <div style={{ flex: 1, minWidth: '300px' }}>
                <h2 style={{ 
                  color: 'white', 
                  marginTop: 0, 
                  fontSize: '28px',
                  fontWeight: 'bold',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}>
                  {selectedMovie.Title} 
                  <span style={{ color: '#ED74FF' }}>({selectedMovie.Year})</span>
                </h2>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
                  {selectedMovie.imdbRating && (
                    <span style={{ 
                      backgroundColor: 'rgba(255, 193, 7, 0.15)', 
                      padding: '6px 12px', 
                      borderRadius: '20px', 
                      fontSize: '14px', 
                      color: '#FFC107',
                      fontWeight: 'bold',
                      border: '1px solid rgba(255, 193, 7, 0.3)',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}>
                      <span style={{ fontSize: '16px' }}>★</span> {selectedMovie.imdbRating}
                    </span>
                  )}
                  {selectedMovie.Genre && selectedMovie.Genre.split(', ').map(g => (
                    <span key={g} style={{ 
                      backgroundColor: 'rgba(23, 162, 184, 0.15)', 
                      padding: '6px 12px', 
                      borderRadius: '20px', 
                      fontSize: '14px', 
                      color: '#17A2B8',
                      fontWeight: 'bold',
                      border: '1px solid rgba(23, 162, 184, 0.3)',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}>
                      {g}
                    </span>
                  ))}
                </div>
                
                {selectedMovie.Director && selectedMovie.Director !== 'N/A' && (
                  <p style={{ 
                    color: '#f0f0f0', 
                    margin: '15px 0',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    padding: '10px 15px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <strong style={{ color: '#ED74FF' }}>Reżyser:</strong> {selectedMovie.Director}
                  </p>
                )}
                
                {selectedMovie.Actors && selectedMovie.Actors !== 'N/A' && (
                  <p style={{ 
                    color: '#f0f0f0', 
                    margin: '15px 0',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    padding: '10px 15px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <strong style={{ color: '#ED74FF' }}>Obsada:</strong> {selectedMovie.Actors}
                  </p>
                )}
                
                {selectedMovie.Plot && selectedMovie.Plot !== 'N/A' ? (
                  <div style={{ marginTop: '25px' }}>
                    <h4 style={{ 
                      color: '#ED74FF', 
                      marginBottom: '12px',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                    }}>
                      Opis
                    </h4>
                    <div style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      padding: '15px 20px',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                    }}>
                      <p style={{ 
                        color: '#f0f0f0', 
                        lineHeight: '1.6',
                        margin: 0,
                        fontSize: '15px'
                      }}>
                        {selectedMovie.Plot}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div style={{ marginTop: '25px' }}>
                    <h4 style={{ 
                      color: '#ED74FF', 
                      marginBottom: '12px',
                      fontSize: '18px',
                      fontWeight: 'bold'
                    }}>
                      Opis
                    </h4>
                    <div style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      padding: '15px 20px',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      <p style={{ 
                        color: '#999', 
                        fontStyle: 'italic',
                        margin: 0
                      }}>
                        Brak opisu filmu.
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Dodatkowe informacje */}
                <div style={{ marginTop: '25px' }}>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '20px',
                    marginTop: '15px'
                  }}>
                    {selectedMovie.Runtime && selectedMovie.Runtime !== 'N/A' && (
                      <div style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        padding: '10px 15px',
                        borderRadius: '10px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        minWidth: '100px',
                        textAlign: 'center'
                      }}>
                        <span style={{ 
                          display: 'block', 
                          fontSize: '16px', 
                          marginBottom: '5px',
                          color: '#ED74FF' 
                        }}>
                          ⏱️ Czas
                        </span>
                        <span style={{ 
                          color: '#f0f0f0',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}>
                          {selectedMovie.Runtime}
                        </span>
                      </div>
                    )}
                    
                    {selectedMovie.Released && selectedMovie.Released !== 'N/A' && (
                      <div style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        padding: '10px 15px',
                        borderRadius: '10px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        minWidth: '100px',
                        textAlign: 'center'
                      }}>
                        <span style={{ 
                          display: 'block', 
                          fontSize: '16px', 
                          marginBottom: '5px',
                          color: '#ED74FF' 
                        }}>
                          📅 Premiera
                        </span>
                        <span style={{ 
                          color: '#f0f0f0',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}>
                          {selectedMovie.Released}
                        </span>
                      </div>
                    )}
                    
                    {selectedMovie.Language && selectedMovie.Language !== 'N/A' && (
                      <div style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        padding: '10px 15px',
                        borderRadius: '10px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        minWidth: '100px',
                        textAlign: 'center'
                      }}>
                        <span style={{ 
                          display: 'block', 
                          fontSize: '16px', 
                          marginBottom: '5px',
                          color: '#ED74FF' 
                        }}>
                          🌐 Język
                        </span>
                        <span style={{ 
                          color: '#f0f0f0',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}>
                          {selectedMovie.Language}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '30px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              paddingTop: '20px'
            }}>
              <div>
                <button
                  onClick={() => addToMyList(selectedMovie, false)}
                  style={{
                    background: 'linear-gradient(145deg, #28a745 0%, #218838 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 8px rgba(40, 167, 69, 0.3)',
                    transition: 'all 0.2s ease',
                    marginRight: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span style={{ fontSize: '18px' }}>📋</span>
                  Do obejrzenia
                </button>
                <button
                  onClick={() => addToMyList(selectedMovie, true)}
                  style={{
                    background: 'linear-gradient(145deg, #007bff 0%, #0069d9 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 8px rgba(0, 123, 255, 0.3)',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span style={{ fontSize: '18px' }}>✓</span>
                  Jako obejrzane
                </button>
              </div>
              
              <button
                onClick={closeMovieDetails}
                style={{
                  backgroundColor: '#ED74FF',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 24px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 8px rgba(237, 116, 255, 0.3)',
                  transition: 'all 0.2s ease'
                }}
              >
                Zamknij
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BrowseMovies;