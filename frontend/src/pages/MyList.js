import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useWindowSize from '../hooks/useWindowSize';

function MyList() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('toWatch'); // 'toWatch' lub 'watched'
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [ratingMovie, setRatingMovie] = useState(null);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  
  const { width } = useWindowSize();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  // Stany dla paginacji
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [moviesPerPage] = useState(4); // Możesz dostosować liczbę filmów na stronie

  useEffect(() => {
    fetchMovies();
  }, [activeTab, currentPage]); // Dodaj currentPage jako zależność

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const watched = activeTab === 'watched';
      console.log(`Pobieranie filmów: watched=${watched}, strona=${currentPage}, limit=${moviesPerPage}`);
      
      const response = await axios.get(
        `/api/movies?watched=${watched}&page=${currentPage}&limit=${moviesPerPage}`
      );
      
      console.log('Odpowiedź z serwera:', response.data);
      
      if (response.data && response.data.movies) {
        console.log(`Pobrano ${response.data.movies.length} filmów`);
        setMovies(response.data.movies);
        setTotalPages(response.data.pages || 1);
      } else {
        console.log('Brak filmów w odpowiedzi lub nieprawidłowy format odpowiedzi');
        setMovies([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Błąd pobierania filmów:', err);
      if (err.response) {
        console.error('Odpowiedź serwera:', err.response.data);
        console.error('Status:', err.response.status);
      }
      setError('Nie udało się pobrać filmów. Spróbuj ponownie później.');
    } finally {
      setLoading(false);
    }
  };

  // Funkcja otwierająca okno oceny dla filmu
  const openRatingModal = (movie) => {
    setRatingMovie(movie);
    setRating(movie.userRating || 5); // Ustaw aktualną ocenę lub domyślną
    setReview(movie.notes || ''); // Ustaw aktualną recenzję lub pustą
  };

  // Funkcja zamykająca okno oceny
  const closeRatingModal = () => {
    setRatingMovie(null);
  };

  // Funkcja do zapisywania oceny i recenzji
  const saveRating = async () => {
    if (!ratingMovie) return;
    
    try {
      // Sprawdź, czy zmieniamy status filmu na obejrzany
      const isMarkingAsWatched = !ratingMovie.watched && ratingMovie.watched !== true;
      
      // Aktualizacja filmu - upewnij się, że parametr watched jest ustawiony na true
      await updateMovie(ratingMovie.id, {
        userRating: rating,
        notes: review,
        watched: true // Zawsze ustaw na true przy zapisie oceny
      });
      
      alert(`Ocena filmu "${ratingMovie.title}" została zaktualizowana.`);
      closeRatingModal(); // Zamknij okno oceny
      
      
    } catch (err) {
      console.error('Błąd aktualizacji oceny:', err);
      alert('Wystąpił błąd podczas aktualizacji oceny filmu.');
    }
  };

  // Przy zmianie zakładki reset do pierwszej strony
  const handleTabChange = (tab) => {
    setCurrentPage(1);
    setActiveTab(tab);
  };

  // Funkcje nawigacji po stronach
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };
  
  // Funkcja do wyświetlania szczegółów filmu
  const showMovieDetails = (movie) => {
    setSelectedMovie(movie);
  };

  // Funkcja do zamykania modalu ze szczegółami
  const closeMovieDetails = () => {
    setSelectedMovie(null);
  };

  // Renderowanie gwiazdek oceny
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 10; i++) {
      stars.push(
        <button
          key={i}
          onClick={() => setRating(i)}
          style={{
            background: 'none',
            border: 'none',
            color: i <= rating ? '#FFC107' : '#aaa',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '0 2px'
          }}
        >
          ★
        </button>
      );
    }
    return stars;
  };

  // Renderowanie gwiazdek tylko do wyświetlania (bez interakcji)
  const renderDisplayStars = (value) => {
    const stars = [];
    for (let i = 1; i <= 10; i++) {
      stars.push(
        <span
          key={i}
          style={{
            color: i <= value ? '#FFC107' : '#444',
            fontSize: '16px',
            padding: '0 1px'
          }}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  // Komponenty kontrolek paginacji
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        marginTop: '30px',
        gap: '10px'
      }}>
        <button
          onClick={goToPrevPage}
          disabled={currentPage === 1}
          style={{
            padding: '8px 12px',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            background: currentPage === 1 ? '#f8f9fa' : 'white',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            color: currentPage === 1 ? '#adb5bd' : '#212529'
          }}
        >
          &laquo; Poprzednia
        </button>
        
        {/* Przyciski stron */}
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(page => {
            // Pokaż tylko bieżącą stronę i sąsiednie (max 5 przycisków)
            return page === 1 || 
                   page === totalPages || 
                   Math.abs(page - currentPage) <= 1 ||
                   (page === 2 && currentPage === 1) ||
                   (page === totalPages - 1 && currentPage === totalPages);
          })
          .map((page, index, array) => {
            // Dodaj wielokropek, jeśli są luki w numeracji
            const showEllipsis = index > 0 && page - array[index - 1] > 1;
            
            return (
              <React.Fragment key={page}>
                {showEllipsis && (
                  <span style={{ margin: '0 8px' }}>...</span>
                )}
                <button
                  onClick={() => goToPage(page)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    background: currentPage === page ? '#007bff' : 'white',
                    color: currentPage === page ? 'white' : '#212529',
                    cursor: 'pointer'
                  }}
                >
                  {page}
                </button>
              </React.Fragment>
            );
          })}
        
        <button
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
          style={{
            padding: '8px 12px',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            background: currentPage === totalPages ? '#f8f9fa' : 'white',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            color: currentPage === totalPages ? '#adb5bd' : '#212529'
          }}
        >
          Następna &raquo;
        </button>
      </div>
    );
  };

  const updateMovie = async (id, updates) => {
    try {
      console.log(`Aktualizacja filmu o ID: ${id}`, updates);
      
      const response = await axios.put(`/api/movies/${id}`, updates);
      console.log('Odpowiedź po aktualizacji:', response.data);
      
      // Sprawdź, czy zmieniliśmy status watched i czy to wymaga zmiany zakładki
      if ('watched' in updates) {
        if (updates.watched && activeTab === 'toWatch') {
          console.log('Film oznaczony jako obejrzany, przełączanie na zakładkę "Obejrzane"');
          handleTabChange('watched');
        } else if (!updates.watched && activeTab === 'watched') {
          console.log('Film oznaczony jako nieobejrzany, przełączanie na zakładkę "Do obejrzenia"');
          handleTabChange('toWatch');
        } else {
          // Jeśli zostajemy w tej samej zakładce, tylko odświeżamy
          console.log('Odświeżanie aktualnej listy filmów');
          fetchMovies();
        }
      } else {
        // Jeśli nie zmieniamy statusu watched, po prostu odświeżamy
        fetchMovies();
      }
      
      return response.data;
    } catch (err) {
      console.error('Błąd aktualizacji filmu:', err);
      if (err.response) {
        console.error('Status błędu:', err.response.status);
        console.error('Dane błędu:', err.response.data);
      }
      alert(`Wystąpił błąd podczas aktualizacji filmu: ${err.message}`);
      throw err;
    }
  };

  const deleteMovie = async (id) => {
    if (window.confirm('Czy na pewno chcesz usunąć ten film z kolekcji?')) {
      try {
        await axios.delete(`/api/movies/${id}`);
        fetchMovies(); // Odświeżenie listy
        alert('Film został usunięty z kolekcji.');
      } catch (err) {
        console.error('Błąd usuwania filmu:', err);
        alert('Wystąpił błąd podczas usuwania filmu.');
      }
    }
  };

  const toggleWatched = (movie) => {
    // Jeśli zmieniamy na obejrzane, pokaż okno oceny
    if (!movie.watched) {
      openRatingModal({...movie, watched: true});
    } else {
      // Jeśli zmieniamy na nieobejrzane, po prostu zaktualizuj
      updateMovie(movie.id, { watched: false });
    }
  };

  // Sprawdzanie, czy pole plot istnieje i ma wartość
  const hasPlot = (movie) => {
    return movie.plot && movie.plot.trim() !== '';
  };

  return (
    <div>
      <h2 style={{ 
        fontSize: '28px', 
        fontWeight: 'bold', 
        marginBottom: '25px', 
        color: '#f0f0f0', 
        textAlign: 'center',
        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
      }}>
        Moja Lista Filmów
      </h2>
      
      {/* Zakładki */}
      <div style={{ 
        display: 'flex', 
        borderBottom: '1px solid rgba(237, 116, 255, 0.3)', 
        marginBottom: '30px',
        justifyContent: 'center',
        padding: '0 10px'
      }}>
        <button
          style={{
            padding: '12px 24px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'toWatch' ? '3px solid #ED74FF' : 'none',
            color: activeTab === 'toWatch' ? '#ED74FF' : '#9e9e9e',
            fontWeight: activeTab === 'toWatch' ? 'bold' : 'normal',
            fontSize: '16px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onClick={() => handleTabChange('toWatch')}
        >
          Do obejrzenia
        </button>
        <button
          style={{
            padding: '12px 24px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'watched' ? '3px solid #ED74FF' : 'none',
            color: activeTab === 'watched' ? '#ED74FF' : '#9e9e9e',
            fontWeight: activeTab === 'watched' ? 'bold' : 'normal',
            fontSize: '16px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onClick={() => handleTabChange('watched')}
        >
          Obejrzane
        </button>
      </div>
      
      {/* Ładowanie */}
      {loading && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px 0',
          color: '#ED74FF',
          fontSize: '18px'
        }}>
          <p>Ładowanie filmów...</p>
        </div>
      )}
      
      {/* Błąd */}
      {error && (
        <div style={{
          backgroundColor: 'rgba(220, 53, 69, 0.1)',
          border: '1px solid rgba(220, 53, 69, 0.3)',
          color: '#dc3545',
          padding: '15px 20px',
          borderRadius: '8px',
          marginBottom: '25px',
          maxWidth: '800px',
          margin: '0 auto 25px auto',
          textAlign: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          {error}
        </div>
      )}
      
      {/* Lista filmów */}
      {!loading && !error && (
        <>
          {movies.length > 0 ? (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '25px', 
              maxWidth: '974px', 
              margin: '0 auto' 
            }}>
              {movies.map((movie) => (
                <div key={movie.id} style={{
                  width: isMobile? '90%':'90%',
                  background: 'linear-gradient(135deg, rgba(75, 75, 75, 0.25) 0%, rgba(45, 45, 45, 0.4) 100%)',
                  borderRadius: '22px',
                  border: '1px solid rgba(237, 116, 255, 0.6)',
                  padding: '20px',
                  display: 'flex',
                  overflow: 'hidden',
                  marginBottom: '5px',
                  boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15), 0 3px 6px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(5px)',
                  position: 'relative'
                }}>
                  {/* Efekt połysku na karcie */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                    zIndex: 1
                  }}></div>
                  
                  <div style={{ 
                    width: '130px', 
                    height: '195px', 
                    flexShrink: 0,
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)'
                  }}>
                    {movie.poster && movie.poster !== 'N/A' ? (
                      <img 
                        src={movie.poster} 
                        alt={`Plakat filmu ${movie.title}`} 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover', 
                          transition: 'transform 0.3s ease',
                          ':hover': {
                            transform: 'scale(1.05)'
                          }
                        }}
                      />
                    ) : (
                      <div style={{ 
                        width: '100%', 
                        height: '100%', 
                        background: 'linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ED74FF',
                        fontSize: '13px',
                        fontWeight: 'bold'
                      }}>
                        Brak plakatu
                      </div>
                    )}
                  </div>
                  
                  <div style={{ 
                    flex: 1, 
                    padding: '0 0 0 20px', 
                    display: 'flex', 
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <h3 style={{ 
                        margin: '0 0 12px 0', 
                        fontSize: '22px', 
                        color: '#ffffff',
                        fontWeight: 'bold',
                        textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                      }}>
                        {movie.title}
                      </h3>
                      
                      <div style={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: '10px', 
                        marginBottom: '12px' 
                      }}>
                        {movie.year && (
                          <span style={{ 
                            backgroundColor: 'rgba(237, 116, 255, 0.15)', 
                            padding: '5px 12px', 
                            borderRadius: '20px', 
                            fontSize: '13px', 
                            color: '#ED74FF',
                            fontWeight: 'bold',
                            border: '1px solid rgba(237, 116, 255, 0.3)',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}>
                            {movie.year}
                          </span>
                        )}
                        {movie.imdbRating && (
                          <span style={{ 
                            backgroundColor: 'rgba(255, 193, 7, 0.15)', 
                            padding: '5px 12px', 
                            borderRadius: '20px', 
                            fontSize: '13px', 
                            color: '#FFC107',
                            fontWeight: 'bold',
                            border: '1px solid rgba(255, 193, 7, 0.3)',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}>
                            IMDB: {movie.imdbRating}
                          </span>
                        )}
                        {movie.genre && movie.genre.length > 0 && (
                          <span style={{ 
                            backgroundColor: 'rgba(23, 162, 184, 0.15)', 
                            padding: '5px 12px', 
                            borderRadius: '20px', 
                            fontSize: '13px', 
                            color: '#17A2B8',
                            fontWeight: 'bold',
                            border: '1px solid rgba(23, 162, 184, 0.3)',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}>
                            {Array.isArray(movie.genre) ? movie.genre[0] : movie.genre}
                          </span>
                        )}
                      </div>
                      
                      {/* Wyświetlanie oceny użytkownika dla obejrzanych filmów */}
                      {activeTab === 'watched' && movie.userRating && (
                        <div style={{ 
                          marginBottom: '15px', 
                          backgroundColor: 'rgba(255, 193, 7, 0.08)',
                          padding: '10px 15px',
                          borderRadius: '12px',
                          border: '1px solid rgba(255, 193, 7, 0.15)'
                        }}>
                          <p style={{ 
                            color: '#e0e0e0', 
                            fontSize: '14px', 
                            margin: '0 0 5px 0',
                            fontWeight: 'bold'
                          }}>
                            Twoja ocena:
                          </p>
                          <div>
                            {renderDisplayStars(movie.userRating)}
                            <span style={{ 
                              color: '#FFC107', 
                              marginLeft: '8px',
                              fontSize: '15px', 
                              fontWeight: 'bold'
                            }}>
                              {movie.userRating}/10
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {/* Wyświetlanie recenzji dla obejrzanych filmów */}
                      {activeTab === 'watched' && movie.notes && (
                        <div style={{ 
                          marginBottom: '15px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          padding: '10px 15px',
                          borderRadius: '12px',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                          <p style={{ 
                            color: '#e0e0e0', 
                            fontSize: '14px',
                            margin: '0 0 5px 0',
                            fontWeight: 'bold'
                          }}>
                            Twoja recenzja:
                          </p>
                          <p style={{ 
                            color: '#e0e0e0', 
                            fontSize: '14px',
                            fontStyle: 'italic',
                            margin: 0,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            lineHeight: '1.4'
                          }}>
                            "{movie.notes}"
                          </p>
                        </div>
                      )}
                      
                      {/* Wyświetlanie opisu dla filmów do obejrzenia */}
                      {activeTab === 'toWatch' && hasPlot(movie) && (
                        <div style={{ 
                          marginBottom: '15px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          padding: '10px 15px',
                          borderRadius: '12px',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                          <p style={{ 
                            margin: '0', 
                            color: '#e0e0e0', 
                            fontSize: '14px',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            lineHeight: '1.5'
                          }}>
                            {movie.plot}
                          </p>
                        </div>
                      )}
                      
                      {activeTab === 'toWatch' && !hasPlot(movie) && (
                        <div style={{ 
                          marginBottom: '15px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          padding: '10px 15px',
                          borderRadius: '12px',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                          <p style={{ 
                            margin: '0', 
                            color: '#999', 
                            fontSize: '14px', 
                            fontStyle: 'italic' 
                          }}>
                            Brak opisu filmu.
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      gap: '10px',
                      flexWrap: 'wrap'
                    }}>
                      <button
                        onClick={() => showMovieDetails(movie)}
                        style={{
                          backgroundColor: '#ED74FF',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 14px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          boxShadow: '0 2px 5px rgba(237, 116, 255, 0.4)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Zobacz więcej
                      </button>
                      {activeTab === 'watched' && (
                        <button
                          onClick={() => openRatingModal(movie)}
                          style={{
                            backgroundColor: '#FFC107',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 14px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            boxShadow: '0 2px 5px rgba(255, 193, 7, 0.4)',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          Edytuj ocenę
                        </button>
                      )}
                      <button
                        onClick={() => toggleWatched(movie)}
                        style={{
                          backgroundColor: movie.watched ? '#28a745' : '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 14px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          boxShadow: movie.watched 
                            ? '0 2px 5px rgba(40, 167, 69, 0.4)' 
                            : '0 2px 5px rgba(0, 123, 255, 0.4)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {movie.watched ? 'Jako nieobejrzany' : 'Jako obejrzany'}
                      </button>
                      <button
                        onClick={() => deleteMovie(movie.id)}
                        style={{
                          backgroundColor: 'rgba(220, 53, 69, 0.85)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 14px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          boxShadow: '0 2px 5px rgba(220, 53, 69, 0.3)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Usuń
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              color: '#9e9e9e', 
              padding: '50px 0',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '15px',
              maxWidth: '600px',
              margin: '0 auto',
              border: '1px dashed rgba(237, 116, 255, 0.3)'
            }}>
              <p style={{ fontSize: '18px' }}>
                {activeTab === 'toWatch'
                  ? 'Nie masz filmów do obejrzenia. Dodaj filmy z wyszukiwarki.'
                  : 'Nie masz obejrzanych filmów. Oznacz filmy jako obejrzane.'}
              </p>
            </div>
          )}
        </>
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
              {selectedMovie.poster && selectedMovie.poster !== 'N/A' ? (
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
                    src={selectedMovie.poster} 
                    alt={`Plakat filmu ${selectedMovie.title}`} 
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
                  Brak plakatu
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
                  {selectedMovie.title} 
                  <span style={{ color: '#ED74FF' }}>({selectedMovie.year})</span>
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
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}>
                      IMDB: {selectedMovie.imdbRating}
                    </span>
                  )}
                  {selectedMovie.userRating && (
                    <span style={{ 
                      backgroundColor: 'rgba(255, 193, 7, 0.15)', 
                      padding: '6px 12px', 
                      borderRadius: '20px', 
                      fontSize: '14px', 
                      color: '#FFC107',
                      fontWeight: 'bold',
                      border: '1px solid rgba(255, 193, 7, 0.3)',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}>
                      Twoja ocena: {selectedMovie.userRating}/10
                    </span>
                  )}
                  {selectedMovie.genre && selectedMovie.genre.length > 0 && (
                    Array.isArray(selectedMovie.genre) 
                      ? selectedMovie.genre.map(g => (
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
                        ))
                      : (
                          <span style={{ 
                            backgroundColor: 'rgba(23, 162, 184, 0.15)', 
                            padding: '6px 12px', 
                            borderRadius: '20px', 
                            fontSize: '14px', 
                            color: '#17A2B8',
                            fontWeight: 'bold',
                            border: '1px solid rgba(23, 162, 184, 0.3)',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                          }}>
                            {selectedMovie.genre}
                          </span>
                        )
                  )}
                </div>
                
                {selectedMovie.director && (
                  <p style={{ 
                    color: '#f0f0f0', 
                    margin: '15px 0',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    padding: '10px 15px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <strong style={{ color: '#ED74FF' }}>Reżyser:</strong> {selectedMovie.director}
                  </p>
                )}
                
                {selectedMovie.actors && (
                  <p style={{ 
                    color: '#f0f0f0', 
                    margin: '15px 0',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    padding: '10px 15px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <strong style={{ color: '#ED74FF' }}>Obsada:</strong> {Array.isArray(selectedMovie.actors) ? selectedMovie.actors.join(', ') : selectedMovie.actors}
                  </p>
                )}
                
                {hasPlot(selectedMovie) ? (
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
                        {selectedMovie.plot}
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
                
                {selectedMovie.notes && (
                  <div style={{ marginTop: '25px' }}>
                    <h4 style={{ 
                      color: '#ED74FF', 
                      marginBottom: '12px',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                    }}>
                      Twoja recenzja
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
                        fontStyle: 'italic',
                        margin: 0,
                        fontSize: '15px'
                      }}>
                        "{selectedMovie.notes}"
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div style={{ textAlign: 'right', marginTop: '30px' }}>
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
      
      {/* Modal oceny filmu */}
      {ratingMovie && (
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
            maxWidth: '600px',
            background: 'linear-gradient(135deg, rgba(40, 40, 40, 0.95) 0%, rgba(20, 20, 20, 0.95) 100%)',
            borderRadius: '16px',
            padding: '25px',
            border: '1px solid rgba(237, 116, 255, 0.6)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(237, 116, 255, 0.2)'
          }}>
            <h2 style={{ 
              color: 'white', 
              textAlign: 'center', 
              marginTop: 0,
              fontSize: '24px',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              {ratingMovie.watched ? 'Edytuj ocenę filmu' : 'Oceń film'}: 
              <span style={{ color: '#ED74FF', marginLeft: '8px' }}>{ratingMovie.title}</span>
            </h2>
            
            <div style={{ 
              textAlign: 'center', 
              margin: '25px 0',
              backgroundColor: 'rgba(255, 193, 7, 0.05)',
              padding: '15px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 193, 7, 0.2)'
            }}>
              {renderStars()}
              <p style={{ 
                color: 'white', 
                marginTop: '10px',
                fontSize: '16px',
                fontWeight: 'bold'
              }}>
                Twoja ocena: <span style={{ color: '#FFC107' }}>{rating}/10</span>
              </p>
            </div>
            
            <div style={{ marginBottom: '25px' }}>
              <label style={{ 
                color: 'white', 
                display: 'block', 
                marginBottom: '8px',
                fontSize: '16px',
                fontWeight: 'bold'
              }}>
                Twoja recenzja:
              </label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Napisz krótką recenzję filmu (opcjonalnie)..."
                style={{
                  width: '100%',
                  minHeight: '150px',
                  backgroundColor: 'rgba(30, 30, 30, 0.9)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '15px',
                  resize: 'vertical',
                  outline: 'none',
                  boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
              <button
                onClick={closeRatingModal}
                style={{
                  backgroundColor: 'rgba(108, 117, 125, 0.8)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  transition: 'all 0.2s ease'
                }}
              >
                Anuluj
              </button>
              <button
                onClick={saveRating}
                style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 8px rgba(0, 123, 255, 0.3)',
                  transition: 'all 0.2s ease'
                }}
              >
                Zapisz
              </button>
            </div>
          </div>
        </div>
      )}
      
      {!loading && !error && movies.length > 0 && renderPagination()}
    </div>
  );
}

export default MyList;