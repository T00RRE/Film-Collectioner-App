// useWindowSize.js
import { useState, useEffect } from 'react';

function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    
    // Dodaj event listener
    window.addEventListener("resize", handleResize);
    
    // Wywołaj handler od razu, aby ustawić początkowy stan
    handleResize();
    
    // Usuń event listener przy odmontowaniu
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
}

export default useWindowSize;