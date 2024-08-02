const apiKey = '11134f43aee98ee74ef2742894ea9191';
const apiBaseUrl = 'https://api.themoviedb.org/3';
const imgBaseUrl = 'https://image.tmdb.org/t/p/w500';

let currentPage = 1;
let currentSearchQuery = '';
let debounceTimer;

async function fetchContent(endpoint) {
    const response = await fetch(`${apiBaseUrl}${endpoint}?api_key=${apiKey}`);
    const data = await response.json();
    return data.results;
}

async function searchContent(query, page = 1) {
    const response = await fetch(`${apiBaseUrl}/search/multi?api_key=${apiKey}&query=${query}&page=${page}`);
    const data = await response.json();
    return data;
}

async function fetchSearchSuggestions(query) {
    const response = await fetch(`${apiBaseUrl}/search/multi?api_key=${apiKey}&query=${query}&page=1`);
    const data = await response.json();
    return data.results.slice(0, 4);
}

async function fetchItemById(itemId, type) {
    const response = await fetch(`${apiBaseUrl}/${type}/${itemId}?api_key=${apiKey}`);
    return response.json();
}

function displayContent(items, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    items.forEach(item => {
        const card = document.createElement('div');
        card.classList.add('movie-card');
        card.innerHTML = `
            <img src="${imgBaseUrl + item.poster_path}" alt="${item.title || item.name}" loading="lazy">
            <div class="movie-card-content">
                <h3>${item.title || item.name}</h3>
                <button onclick="addToFavorites('${item.id}', '${item.media_type}')" class="favorite-button">Add to List</button>
            </div>
        `;
        container.appendChild(card);
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
            const card = document.createElement('div');
            card.classList.add('movie-card');
            card.innerHTML = `
                <img src="${imgBaseUrl + item.poster_path}" alt="${item.title || item.name}" loading="lazy">
                <div class="movie-card-content">
                    <h3>${item.title || item.name}</h3>
                    <button onclick="addToFavorites('${item.id}', '${item.media_type}')" class="favorite-button">Add to List</button>
                </div>
            `;
            searchResultsGrid.appendChild(card);
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
                    searchContent(item.title || item.name);
                });
                suggestionsContainer.appendChild(suggestionItem);
            }
        });
        suggestionsContainer.classList.remove('hidden');
    } else {
        suggestionsContainer.classList.add('hidden');
    }
}

async function addToFavorites(itemId, type) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (!favorites.some(fav => fav.id === itemId)) {
        const itemDetails = await fetchItemById(itemId, type);
        favorites.push({
            id: itemId,
            title: itemDetails.title || itemDetails.name,
            poster_path: itemDetails.poster_path,
            overview: itemDetails.overview,
            media_type: type,
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
        const searchData = await searchContent(query);
        displaySearchResults(searchData.results);
        document.getElementById('searchSuggestions').classList.add('hidden');
    }
});

document.getElementById('loadMoreButton').addEventListener('click', async () => {
    currentPage++;
    const searchData = await searchContent(currentSearchQuery, currentPage);
    displaySearchResults(searchData.results, true);
});

async function loadContent(sectionId, movieEndpoint, tvEndpoint) {
    const section = document.querySelector(`section[data-section="${sectionId}"]`);
    if (!section) {
        console.error(`Section with data-section="${sectionId}" not found`);
        return;
    }
    const switchElement = section.querySelector('input[type="checkbox"]');
    const contentContainer = section.querySelector('.movie-row');
    let isMovie = true;

    async function updateContent() {
        const endpoint = isMovie ? movieEndpoint : tvEndpoint;
        const content = await fetchContent(endpoint);
        displayContent(content, contentContainer.id);
    }

    switchElement.addEventListener('change', () => {
        isMovie = !switchElement.checked;
        updateContent();
    });

    await updateContent();
}

async function initializeApp() {
    await loadContent('popular', '/movie/popular', '/tv/popular');
    await loadContent('topRated', '/movie/top_rated', '/tv/top_rated');
    await loadContent('latest', '/movie/now_playing', '/tv/on_the_air');
}

initializeApp();
