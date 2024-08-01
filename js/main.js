const apiKey = '11134f43aee98ee74ef2742894ea9191';
const apiBaseUrl = 'https://api.themoviedb.org/3';
const imgBaseUrl = 'https://image.tmdb.org/t/p/w500';

let currentPage = 1;
let currentSearchQuery = '';
let debounceTimer;

async function fetchMovies(endpoint) {
    const response = await fetch(`${apiBaseUrl}${endpoint}?api_key=${apiKey}`);
    const data = await response.json();
    return data.results;
}

async function searchMovies(query, page = 1) {
    const response = await fetch(`${apiBaseUrl}/search/multi?api_key=${apiKey}&query=${query}&page=${page}`);
    const data = await response.json();
    return data;
}

async function fetchSearchSuggestions(query) {
    const response = await fetch(`${apiBaseUrl}/search/multi?api_key=${apiKey}&query=${query}&page=1`);
    const data = await response.json();
    return data.results.slice(0, 4);
}

async function fetchMovieById(movieId) {
    const response = await fetch(`${apiBaseUrl}/movie/${movieId}?api_key=${apiKey}`);
    return response.json();
}

function displayMovies(movies, containerId) {
    const moviesContainer = document.getElementById(containerId);
    moviesContainer.innerHTML = '';
    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');
        movieCard.innerHTML = `
            <img src="${imgBaseUrl + movie.poster_path}" alt="${movie.title || movie.name}" loading="lazy">
            <div class="movie-card-content">
                <h3>${movie.title || movie.name}</h3>
                <button onclick="addToFavorites('${movie.id}')" class="favorite-button">Add to List</button>
            </div>
        `;
        moviesContainer.appendChild(movieCard);
    });
}

function displaySearchResults(results, append = false) {
    const searchResultsSection = document.getElementById('searchResults');
    const regularContent = document.getElementById('regularContent');
    const searchResultsGrid = document.getElementById('searchResultsGrid');
    const loadMoreButton = document.getElementById('loadMoreButton');

    if (!append) {
        searchResultsGrid.innerHTML = '';
        searchResultsSection.classList.remove('hidden');
        regularContent.classList.add('hidden');
    }

    results.forEach(item => {
        if (item.media_type === 'movie' || item.media_type === 'tv') {
            const movieCard = document.createElement('div');
            movieCard.classList.add('movie-card');
            movieCard.innerHTML = `
                <img src="${imgBaseUrl + item.poster_path}" alt="${item.title || item.name}" loading="lazy">
                <div class="movie-card-content">
                    <h3>${item.title || item.name}</h3>
                    <button onclick="addToFavorites('${item.id}')" class="favorite-button">Add to List</button>
                </div>
            `;
            searchResultsGrid.appendChild(movieCard);
        }
    });

    loadMoreButton.style.display = results.length === 20 ? 'inline-block' : 'none';
}

function displaySearchSuggestions(suggestions) {
    const suggestionsContainer = document.getElementById('searchSuggestions');
    suggestionsContainer.innerHTML = '';
    
    if (suggestions.length > 0) {
        suggestions.forEach(item => {
            if (item.media_type === 'movie' || item.media_type === 'tv') {
                const suggestionItem = document.createElement('div');
                suggestionItem.classList.add('suggestion-item');
                suggestionItem.textContent = item.title || item.name;
                suggestionItem.addEventListener('click', () => {
                    document.getElementById('searchInput').value = item.title || item.name;
                    suggestionsContainer.classList.add('hidden');
                    searchMovies(item.title || item.name);
                });
                suggestionsContainer.appendChild(suggestionItem);
            }
        });
        suggestionsContainer.classList.remove('hidden');
    } else {
        suggestionsContainer.classList.add('hidden');
    }
}

async function addToFavorites(movieId) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (!favorites.some(fav => fav.id === movieId)) {
        const movieDetails = await fetchMovieById(movieId);
        favorites.push({
            id: movieId,
            title: movieDetails.title || movieDetails.name,
            poster_path: movieDetails.poster_path,
            overview: movieDetails.overview,
            notes: ''
        });
        localStorage.setItem('favorites', JSON.stringify(favorites));
        alert('Added to your list!');
    } else {
        alert('This item is already in your list.');
    }
}

document.getElementById('searchInput').addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    const query = e.target.value;
    
    if (query.length > 2) {
        debounceTimer = setTimeout(async () => {
            const suggestions = await fetchSearchSuggestions(query);
            displaySearchSuggestions(suggestions);
        }, 300);
    } else {
        document.getElementById('searchSuggestions').classList.add('hidden');
    }
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) {
        document.getElementById('searchSuggestions').classList.add('hidden');
    }
});

document.getElementById('searchButton').addEventListener('click', async () => {
    const query = document.getElementById('searchInput').value;
    if (query) {
        currentSearchQuery = query;
        currentPage = 1;
        const searchData = await searchMovies(query);
        displaySearchResults(searchData.results);
        document.getElementById('searchSuggestions').classList.add('hidden');
    }
});

document.getElementById('loadMoreButton').addEventListener('click', async () => {
    currentPage++;
    const searchData = await searchMovies(currentSearchQuery, currentPage);
    displaySearchResults(searchData.results, true);
});

async function initializeApp() {
    const popularMovies = await fetchMovies('/movie/popular');
    const topRatedMovies = await fetchMovies('/movie/top_rated');
    const latestMovies = await fetchMovies('/movie/now_playing');
    const popularTVShows = await fetchMovies('/tv/popular');

    displayMovies(popularMovies, 'popularMovies');
    displayMovies(topRatedMovies, 'topRatedMovies');
    displayMovies(latestMovies, 'latestMovies');
    displayMovies(popularTVShows, 'popularTVShows');
}

initializeApp();