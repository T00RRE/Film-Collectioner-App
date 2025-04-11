# Film Collectioner App

Film Collectioner to aplikacja webowa do zarządzania kolekcją filmów, umożliwiająca przechowywanie, kategoryzowanie i ocenianie obejrzanych filmów oraz tworzenie listy filmów do obejrzenia.

## Funkcjonalności

- **Wyszukiwanie filmów** - przeszukiwanie bazy Open Movie Database (OMDb)
- **Rekomendacje filmowe** - przeglądanie popularnych tytułów filmowych
- **Zarządzanie kolekcją** - dodawanie do listy "Do obejrzenia" lub "Obejrzane"
- **Ocenianie i recenzowanie** - wystawianie ocen (w skali 1-10) oraz pisanie własnych recenzji
- **Podgląd szczegółów** - wyświetlanie informacji o filmach (reżyser, obsada, opis, rok produkcji)
- **Kategoryzacja** - podział na filmy obejrzane i do obejrzenia
- **Paginacja i sortowanie** - przeglądanie filmów w kolekcji w sposób uporządkowany

## Technologie

### Frontend

- React.js
- Axios (komunikacja z API)
- HTML/CSS (UI)

### Backend

- Node.js
- Express.js
- Sequelize ORM
- PostgreSQL

### Integracje zewnętrzne

- OMDb API (Open Movie Database)

## Uruchomienie aplikacji

Aplikacja jest dostępna online pod adresem: https://film-collectioner-app-1.onrender.com/


### Wymagania wstępne

- Node.js (v14+)
- npm lub yarn
- PostgreSQL (lokalna instancja lub usługa w chmurze)
- Klucz API dla OMDb (dostępny na stronie http://www.omdbapi.com/)

### Konfiguracja bazy danych

1. Utwórz bazę danych PostgreSQL
2. Skonfiguruj dostęp do bazy danych w pliku `.env` (lub użyj zmiennej środowiskowej `DATABASE_URL`)

### Instalacja i uruchomienie

1. Sklonuj repozytorium:
    
    ```bash
    bash
    [ ]
    
    git clone https://github.com/T00RRE/Film-Collectioner-App.git
    cd film-collectioner-app
    
    ```
    
2. Konfiguracja backendu:
    
    ```bash
    bash
    [ ]
    
    cd backend
    npm install
    
    # Utworzenie pliku .env z konfiguracją
    echo "PORT=5000
    DATABASE_URL=postgresql://user:password@localhost:5432/film_collector
    NODE_ENV=development
    OMDB_API_KEY=your_api_key" > .env
    
    # Uruchomienie serwera backendowego
    npm start
    
    ```
    
3. Konfiguracja frontendu (w nowym terminalu):
    
    ```bash
    bash
    [ ]
    
    cd ../frontend
    npm install
    
    # Uruchomienie serwera deweloperskiego
    npm start
    
    ```
    
4. Otwórz przeglądarkę pod adresem [http://localhost:3000](http://localhost:3000/)

### Uruchomienie z użyciem Docker

Alternatywnie można użyć Docker do uruchomienia aplikacji:

```bash
bash
[ ]

docker-compose up

```

## Struktura projektu

```
[ ]

film-collectioner-app/
├── backend/                # Kod serwera
│   ├── config/             # Konfiguracja
│   ├── controllers/        # Kontrolery API
│   ├── models/             # Definicje modeli danych
│   ├── routes/             # Trasy API
│   └── server.js           # Główny plik serwera
│
├── frontend/               # Kod interfejsu użytkownika
│   ├── public/             # Zasoby statyczne
│   └── src/                # Kod źródłowy React
│       ├── components/     # Komponenty React
│       ├── pages/          # Główne widoki aplikacji
│       ├── services/       # Serwisy do komunikacji z API
│       └── hooks/          # Własne hooki React
│
└── docker-compose.yml      # Konfiguracja Docker

```

## API Endpoints

### Movies API

- `GET /api/movies` - pobieranie listy filmów (paginacja, sortowanie, filtrowanie)
- `GET /api/movies/:id` - pobieranie szczegółów filmu
- `POST /api/movies` - dodawanie filmu do kolekcji
- `PUT /api/movies/:id` - aktualizacja informacji o filmie
- `DELETE /api/movies/:id` - usuwanie filmu z kolekcji

### OMDb API

- `GET /api/omdb/search` - wyszukiwanie filmów w zewnętrznej bazie
- `GET /api/omdb/detail/:id` - pobieranie szczegółów filmu z zewnętrznej bazy
- `GET /api/omdb/recommended` - pobieranie rekomendowanych filmów

## Baza danych

Aplikacja wykorzystuje bazę danych PostgreSQL z następującym modelem danych:

### Movie

- `id` (Integer, Primary Key) - unikalny identyfikator filmu w kolekcji
- `imdbId` (String) - identyfikator filmu w bazie OMDb
- `title` (String) - tytuł filmu
- `year` (Integer) - rok produkcji
- `poster` (String) - URL plakatu
- `plot` (Text) - opis fabuły
- `director` (String) - reżyser
- `actors` (Array) - lista aktorów
- `genre` (Array) - gatunki filmu
- `watched` (Boolean) - status obejrzenia (true/false)
- `userRating` (Integer) - ocena użytkownika (1-10)
- `notes` (Text) - recenzja/notatki użytkownika
- `imdbRating` (Decimal) - ocena z bazy OMDb
- `createdAt` (Date) - data dodania do kolekcji
- `updatedAt` (Date) - data ostatniej aktualizacji

## Autor

Stworzone przez Mikołaj Leski

## Licencja

Ten projekt jest dostępny na licencji MIT.
