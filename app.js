/* =========================
    Constants
   ========================= */
const POKE_API_BASE = 'https://pokeapi.co/api/v2';
const ENDPOINTS = {
    pokemon: (id) => `${POKE_API_BASE}/pokemon/${id}`, // Endpoint to fetch a specific Pokémon by ID
    species: (id) => `${POKE_API_BASE}/pokemon-species/${id}`, // Endpoint to fetch a specific Pokémon species by ID
    types: (name) => `${POKE_API_BASE}/type/${name}`, // Endpoint to fetch a specific type by name
    allPokemon: () => `${POKE_API_BASE}/pokemon?limit=1025` // Endpoint to fetch all Pokémon names
};

/* =========================
    Name Corrections
   ========================= */
const nameCorrections = {
    "ho-oh": "Ho-Oh",
    "farfetchd": "Farfetch'd",
    "sirfetchd": "Sirfetch'd",
    "type-null": "Type: Null",
    "mr-mime": "Mr. Mime",
    "mr-rime": "Mr. Rime",
    "mime-jr": "Mime Jr.",
    "porygon-z": "Porygon-Z"
}


/* =========================
    DOM Elements
   ========================= */
const container = document.querySelector('#pokemon-container'); // Container to display Pokémon cards
const searchBar = document.querySelector('#search-bar'); // Search bar input element
const searchButton = document.querySelector('#search-button'); // Search button element
const clearButton = document.querySelector('#clear-button'); // Clear button element
const suggestionsContainer = document.querySelector('#suggestions-container'); // Container to display search suggestions
const filtersContainer = document.querySelector('#filters-container');
const typeFilters = document.querySelectorAll('.type-filter');
const filterOptions = document.querySelectorAll('input[name="filter-option');


/* =========================
    State Variables
   ========================= */

const maxPokemon = 1025; // Total number of Pokémon
const allPokemon = new Map(); // Map to store loaded Pokémon data
const allPokemonNames = []; // Array to store all Pokémon names


// State Variables for loading Pokémon in batches
const batchSize = 25;
let currentOffset = 1;
let isSearchMode = false;
let isLoading = false;
let selectedPokemonApiName = "";

/* =========================
    Fetch Functions
   ========================= */

// Fetch Pokémon Data From The API
async function fetchPokemon(id) {
    try {
        const url = ENDPOINTS.pokemon(id);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch Pokemon with ID ${id}`);
        return await response.json();
    } catch (e) {
        console.error(e);
        return null;
    }
}

async function fetchPokemonSpecies(id) {
    try {
        const url = ENDPOINTS.species(id);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch Pokémon Species with ID ${id}`);
        return await response.json();
    } catch (e) {
        console.error(e);
        return null;
    }
}

// Fetch All Pokémon Names From The API
async function fetchAllPokemonNames() {
    try {
        const url = ENDPOINTS.allPokemon();
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch all Pokémon names');
        const data = await response.json();
        return data.results.map(pokemon => pokemon.name); // Extract and return Pokémon names
    } catch (e) {
        console.error(e);
        return [];
    }
}

/* =========================
    Utility Functions
   ========================= */
function capitalizeName(name) {
    return name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// Debounce function to limit the rate at which a function can fire
function debounce(fn, delay) {
    let debounceTimer;
    return function (...args) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => fn(...args), delay);
    }
}

function getDisplayName(apiName) {
    return nameCorrections[apiName] || capitalizeName(apiName);
}

function searchButtonFunction() {
    const query = searchBar.value.trim().toLowerCase();
    const apiNameToUse = selectedPokemonApiName || query;
    searchAndFilterPokemon(apiNameToUse);
}

/* =========================
    DOM Manipulation Functions
   ========================= */

// Clears the Pokémon container
function clearContainer() {
    container.innerHTML = '';
}

// Clears the suggestions container
function clearSuggestionsContainer() {
    suggestionsContainer.innerHTML = '';
}

// Displays a "No Pokémon found" message
function displayNoResultsMessage() {
    const noResultsMessage = document.createElement('p');
    noResultsMessage.textContent = 'No Pokémon found';
    container.appendChild(noResultsMessage);
}

// Sets the loading indicator visibility
function setLoading(isLoading) {
    const loadingIndicator = document.querySelector('#loading-indicator');
    loadingIndicator.style.display = isLoading ? 'block' : 'none';
}

// Creates a Pokémon card element from the provided Pokémon data
async function createPokemonCard(data) {
    const pokemonCard = document.createElement('div');
    const cardImage = document.createElement('img');
    const cardId = document.createElement('p');
    const cardName = document.createElement('h2');
    const cardTypes = document.createElement('div');
    const textContent = document.createElement('div');
    const topContainer = document.createElement('div');
    const bottomContainer = document.createElement('div');

    pokemonCard.classList.add('pokemon-card');
    cardId.classList.add('card-id');
    cardTypes.classList.add('card-types');
    textContent.classList.add('text-content');
    topContainer.classList.add('top-container');
    bottomContainer.classList.add('bottom-container');

    cardImage.src = data.sprites.other['official-artwork'].front_default;
    cardName.innerText = getDisplayName(data.species.name);
    cardId.innerText = `${String(data.id).padStart(4, '0')}`;
    data.types.forEach(t => {
        const typeElement = document.createElement('p');
        typeElement.classList.add('type', t.type.name);
        typeElement.innerText = capitalizeName(t.type.name);
        cardTypes.appendChild(typeElement);
    });

    textContent.appendChild(cardId);
    textContent.appendChild(cardName);
    topContainer.appendChild(cardImage);
    bottomContainer.appendChild(textContent);
    bottomContainer.appendChild(cardTypes);
    pokemonCard.appendChild(topContainer);
    pokemonCard.appendChild(bottomContainer);

    return pokemonCard;
}

// Appends a list of Pokémon cards to the container
async function appendPokemonCard(pokemonList) {
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < pokemonList.length; i += 10) {
        const batch = await Promise.all(pokemonList.slice(i, i + 10).map(createPokemonCard));
        batch.forEach(card => fragment.appendChild(card));
        container.appendChild(fragment);
    }
}

/* =========================
    Main Functions
   ========================= */

// Loads a batch of Pokémon and appends their cards to the container
async function loadPokemon() {
    if (isLoading) return;
    isLoading = true;
    setLoading(true);
    console.time('Load Pokémon Batch'); // Start timing
    const pokemonList = [];
    for (let i = currentOffset; i < currentOffset + batchSize && i <= maxPokemon; i++) {
        try {
            const data = await fetchPokemon(i);
            if (data) {
                pokemonList.push(data);
                allPokemon.set(data.name.toLowerCase(), data);
            }
        } catch (e) {
            console.error(`Failed to load Pokémon with ID ${i}`, e);
        }
    }
    await appendPokemonCard(pokemonList);
    currentOffset += batchSize;
    isLoading = false;
    setLoading(false);

    console.timeEnd('Load Pokémon Batch');
}

// Filters the displayed Pokémon based on the search query
async function searchAndFilterPokemon(query) {
    const queryToLowerCase = query.trim().toLowerCase();
    clearContainer();

    if (query === '') {
        isSearchMode = false;
        appendPokemonCard(Array.from(allPokemon.values()));
        return;
    }
    isSearchMode = true;
    const pokemon = allPokemon.get(queryToLowerCase);

    if (pokemon) {
        appendPokemonCard([pokemon]);
    } else if (allPokemonNames.includes(queryToLowerCase)) {
        try {
            const data = await fetchPokemon(queryToLowerCase);
            if (data) {
                appendPokemonCard([data]);
            } else {
                displayNoResultsMessage();
            }
        } catch (error) {
            console.error(error);
            displayNoResultsMessage();
        }
    } else {
        displayNoResultsMessage();
    }
};

// Shows search suggestions based on the query
async function showSuggestions(query) {
    clearSuggestionsContainer();
    if (query.trim().length === 0) return;

    const normalizedQuery = query.toLowerCase().replace(/\s+/g, '');

    const filteredPokemonNames = allPokemonNames.filter(name => {
        const normalizedName = name.toLowerCase().replace(/\s+/g, '');
        return normalizedName.startsWith(normalizedQuery);
    });

    for (const name of filteredPokemonNames.slice(0, 5)) {
        const displayName = getDisplayName(name);
        const apiName = nameCorrections[displayName] || name.toLowerCase();

        const suggestion = document.createElement('div');
        suggestion.classList.add('suggestion');
        suggestion.textContent = displayName;
        suggestion.addEventListener('click', () => {
            searchBar.value = displayName;
            selectedPokemonApiName = apiName;
            clearSuggestionsContainer();
        });
        suggestionsContainer.appendChild(suggestion);
    }
}

// Debounced version of showSuggestions to limit the rate of firing
const debouncedShowSuggestions = debounce(showSuggestions, 300);

/* =========================
    Event Listeners
   ========================= */

// Event listener for search bar input
searchBar.addEventListener('input', (e) => {
    debouncedShowSuggestions(e.target.value);
});

searchBar.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        searchButtonFunction()
    }
})

// Event listener for search button click
searchButton.addEventListener('click', () => {
    searchButtonFunction();
});

// Event listener for clear button click
clearButton.addEventListener('click', () => {
    searchBar.value = '';
    clearSuggestionsContainer();
    isSearchMode = false;
    searchAndFilterPokemon('');
});


// Infinite scroll to load more Pokémon when the user scrolls near the bottom of the page
window.addEventListener('scroll', () => {
    if (isSearchMode || isLoading) return;
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
        loadPokemon();
    }
});

// Initial load of Pokémon names and the first batch of Pokémon data
document.addEventListener('DOMContentLoaded', async () => {
    allPokemonNames.push(...await fetchAllPokemonNames());
    loadPokemon();
});
