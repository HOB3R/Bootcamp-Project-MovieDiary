const apiKey = '11134f43aee98ee74ef2742894ea9191';
const apiBaseUrl = 'https://api.themoviedb.org/3';
const imgBaseUrl = 'https://image.tmdb.org/t/p/w500';

document.addEventListener('DOMContentLoaded', () => {
    const toggleButtons = document.querySelectorAll('.toggle-button');
    const sections = document.querySelectorAll('.grid');

    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.dataset.category;

            toggleButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            sections.forEach(section => {
                section.classList.add('hidden');
                if (section.id.includes(category)) {
                    section.classList.remove('hidden');
                }
            });
        });
    });

    fetchMoviesList();
    fetchSeriesList();
});

async function fetchMoviesList() {
    const response = await fetch(`${apiBaseUrl}/account/{account_id}/favorite/movies?api_key=${apiKey}`);
    const data = await response.json();
    renderList(data.results, 'journalMovies');
}

async function fetchSeriesList() {
    const response = await fetch(`${apiBaseUrl}/account/{account_id}/favorite/tv?api_key=${apiKey}`);
    const data = await response.json();
    renderList(data.results, 'journalSeries');
}

function renderList(items, elementId) {
    const container = document.getElementById(elementId);
    container.innerHTML = items.map(item => `
        <div class="movie-card">
            <img src="${imgBaseUrl + item.poster_path}" alt="${item.title}">
            <div class="movie-card-content">
                <h3>${item.title}</h3>
                <p>${item.overview ? item.overview.slice(0, 150) + '...' : 'No overview available.'}</p>
                <textarea class="notes-textarea" placeholder="Add your notes...">${item.notes || ''}</textarea>
                <button onclick="saveNotes('${item.id}')" class="favorite-button">Save Notes</button>
                <button onclick="removeFromFavorites('${item.id}')" class="remove-button">Remove from List</button>
            </div>
        </div>
    `).join('');
}

function saveNotes(movieId) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const noteTextarea = event.target.previousElementSibling;
    const notes = noteTextarea.value;

    favorites = favorites.map(movie => {
        if (movie.id === movieId) {
            return { ...movie, notes: notes };
        }
        return movie;
    });

    localStorage.setItem('favorites', JSON.stringify(favorites));
    alert('Notes saved!');
}

function removeFromFavorites(movieId) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites = favorites.filter(movie => movie.id !== movieId);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    displayFavorites();
    alert('Removed from your list!');
}

function displayFavorites() {
    const journalMoviesContainer = document.getElementById('journalMovies');
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    journalMoviesContainer.innerHTML = '';

    favorites.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');
        movieCard.innerHTML = `
            <img src="${imgBaseUrl + movie.poster_path}" alt="${movie.title}" loading="lazy">
            <div class="movie-card-content">
                <h3>${movie.title}</h3>
                <p>${movie.overview ? movie.overview.slice(0, 150) + '...' : 'No overview available.'}</p>
                <textarea class="notes-textarea" placeholder="Add your notes...">${movie.notes || ''}</textarea>
                <button onclick="saveNotes('${movie.id}')" class="favorite-button">Save Notes</button>
                <button onclick="removeFromFavorites('${movie.id}')" class="remove-button">Remove from List</button>
            </div>
        `;
        journalMoviesContainer.appendChild(movieCard);
    });
}

displayFavorites();
