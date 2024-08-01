const apiKey = '11134f43aee98ee74ef2742894ea9191';
const apiBaseUrl = 'https://api.themoviedb.org/3';
const imgBaseUrl = 'https://image.tmdb.org/t/p/w500';

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

displayFavorites();