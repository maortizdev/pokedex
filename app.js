// Generation Filter

// TODO: Fetch generation data from the species endpoint
// PokeAPI provides generation info as {generation: {name: "generation-i"}}

// TODO: Map generation names to IDs for the dropdown
// Example: {"generation-i": "1"}

// TODO: Create a dropdown menu for generation filter
// Place it above the Pokémon list and style it consistently with other filters.
// select#generation-filter -> option[Generation 1].value(generation-i), etc.

// TODO: Add generation info to Pokémon data during fetch
// Decide whether to pre-fetch or fetch lazily for performance.

// TODO: Write filtering logic for generation
// Combine results with other active filters (e.g., types, weaknesses, etc.)

/* =========================
    Constants
   ========================= */
// Base URL for PokeAPI
const POKE_API_BASE = 'https://pokeapi.co/api/v2';
// API endpoints for specific data
const ENDPOINTS = {
    pokemon: (id) => `${POKE_API_BASE}/pokemon/${id}`, // Fetch Pokémon by ID
    species: (id) => `${POKE_API_BASE}/pokemon-species/${id}`, // Fetch Pokémon species by ID
    types: (name) => `${POKE_API_BASE}/type/${name}`, // Fetch type details by name
    abilities: () => `${POKE_API_BASE}/ability?limit=1000`, // Fetch all abilities
    allPokemon: () => `${POKE_API_BASE}/pokemon?limit=1000`, // Fetch all Pokémon names
};

/* =========================
    Name Corrections
   ========================= */
// Manual corrections for Pokémon names with special formatting
const NAME_CORRECTIONS = {
    "ho-oh": "Ho-Oh",
    "farfetchd": "Farfetch'd",
    "sirfetchd": "Sirfetch'd",
    "type-null": "Type: Null",
    "mr-mime": "Mr. Mime",
    "mr-rime": "Mr. Rime",
    "mime-jr": "Mime Jr.",
    "porygon-z": "Porygon-Z"
};

/* =========================
    DOM Elements
   ========================= */
// Cached references to frequently accessed DOM elements
const DOMElements = {
    container: document.querySelector('#pokemon-container'),
    suggestionsContainer: document.querySelector('#suggestions-container'),
    searchBar: document.querySelector('#search-bar'),
    searchButton: document.querySelector('#search-button'),
    clearButton: document.querySelector('#clear-button'),
    applyFilters: document.querySelector('#apply-filters'),
    filterRadios: document.querySelectorAll('input[name="filterMode"]'),
    typeCheckboxes: document.querySelector('#type-checkboxes'),
    secondTypeCheckboxes: document.querySelector('#second-type-checkboxes'),
    abilitiesDropdown: document.querySelector('#abilities-dropdown')
};

/* =========================
    State Variables
   ========================= */
// Application state for dynamic behavior and caching
const state = {
    allPokemon: new Map(), // Stores fetched Pokémon data
    allPokemonNames: [], // List of Pokémon names for suggestions and search
    selectedTypes: new Set(), // Selected primary types for filtering
    selectedSecondTypeSet: new Set(), // Selected secondary types for filtering
    batchSize: 1025, // Number of Pokémon to fetch per batch
    currentOffset: 1, // Current offset for batch loading
    isSearchMode: false, // Whether the app is in search mode
    isLoading: false, // Loading state for UI feedback
    selectedPokemonApiName: "", // Selected Pokémon for detailed view
    selectedAbility: null // Selected ability for filtering
};

/* =========================
    Fetch Functions
   ========================= */
// Fetches data from a given URL with error handling
async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch data from ${url}`);
        return await response.json();
    } catch (error) {
        console.error(error)
    }
};

// Fetch Pokémon data by ID
function fetchPokemon(id) {
    return fetchData(ENDPOINTS.pokemon(id));
};

// Fetch Pokémon species data by ID
function fetchPokemonSpecies(id) {
    return fetchData(ENDPOINTS.species(id));
};

// Fetch all abilities
async function fetchAbilities() {
    const data = await fetchData(ENDPOINTS.abilities());
    return data ? data.results.map(abilitiy => abilitiy.name) : [];
};

// Fetch all Pokémon names
async function fetchAllPokemonNames() {
    const data = await fetchData(ENDPOINTS.allPokemon());
    return data ? data.results.map(pokemon => pokemon.name) : [];
};

/* =========================
    Utility Functions
   ========================= */
// Capitalizes and formats a given name
function capitalizeName(name) {
    return name
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

// Gets a display name for Pokémon, applying corrections if necessary
function getDisplayName(apiName) {
    return NAME_CORRECTIONS[apiName] || capitalizeName(apiName);
}

// Debounce function to limit the rate of function calls
function debounce(fn, delay) {
    let debounceTimer;
    return function (...args) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => fn(...args), delay);
    }
}

function searchButtonFunction() {
    const query = DOMElements.searchBar.value.trim().toLowerCase();
    const apiNameToUse = state.selectedPokemonApiName || query;
    searchAndFilterPokemon(apiNameToUse);
}

/* =========================
    Filtering Functions
   ========================= */
// Filter Pokémon by selected types (single or dual)
function filterByAnyType(pokemon, selectedFirstTypes) {
    return selectedFirstTypes.some(type =>
        pokemon.types.some(t => t.type.name === type))
}

// Filter Pokémon with dual types
function filterByDoubleType(pokemon, selectedFirstTypes, selectedSecondTypes) {
    return pokemon.types.length === 2 &&
        selectedFirstTypes.some(type => pokemon.types.some(t => t.type.name === type)) &&
        selectedSecondTypes.some(type => pokemon.types.some(t => t.type.name === type))
}

// Filter Pokémon with a single type
function filterBySingleType(pokemon, selectedFirstTypes) {
    return pokemon.types.length === 1 &&
        selectedFirstTypes.includes(pokemon.types[0].type.name)
}

// Filter Pokémon by ability
function filterByAbility(pokemon, selectedAbility) {
    return pokemon.abilities.some(a =>
        a.ability.name === selectedAbility);
};

function getSelectedTypes() {
    return Array.from(DOMElements.typeCheckboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);
}

function getSelectedAbility() {
    return DOMElements.abilitiesDropdown.value || null;
}

/* =========================
    DOM Manipulation Functions
   ========================= */
// Clears Pokémon cards from the container
function clearContainer() {
    DOMElements.container.innerHTML = '';
}

// Displays a "No Pokémon found" message
function clearSuggestionsContainer() {
    DOMElements.suggestionsContainer.innerHTML = '';
}

// Displays a "No Pokémon found" message
function displayNoResultsMessage() {
    const noResultsMessage = document.createElement('p');
    noResultsMessage.textContent = 'No Pokémon found';
    DOMElements.container.appendChild(noResultsMessage);
}
function selectSecondTypeMessage() {
    const selectSecondTypeMessage = document.createElement('p');
    selectSecondTypeMessage.textContent = 'Please, select a second type.';
    DOMElements.container.appendChild(selectSecondTypeMessage);
}

// Sets the loading indicator visibility
function setLoading(isLoading) {
    const loadingIndicator = document.querySelector('#loading-indicator');
    loadingIndicator.style.display = isLoading ? 'block' : 'none';
}

// Creates a Pokémon card element from the provided Pokémon data
async function createPokemonCard(data) {
    const pokemonCard = document.createElement('div');
    pokemonCard.classList.add('pokemon-card');

    const cardImage = document.createElement('img');
    cardImage.src = data.sprites.other['official-artwork'].front_default;

    const cardId = document.createElement('p');
    cardId.classList.add('card-id');
    cardId.innerText = `${String(data.id).padStart(4, '0')}`;

    const cardName = document.createElement('h2');
    cardName.innerText = getDisplayName(data.species.name);

    const cardTypes = document.createElement('div');
    cardTypes.classList.add('card-types');
    data.types.forEach(t => {
        const typeElement = document.createElement('p');
        typeElement.classList.add('type', t.type.name);
        typeElement.innerText = capitalizeName(t.type.name);
        cardTypes.appendChild(typeElement);
    });

    const textContent = document.createElement('div');
    textContent.classList.add('text-content');
    textContent.append(cardId, cardName);

    const topContainer = document.createElement('div');
    topContainer.classList.add('top-container');
    topContainer.appendChild(cardImage);

    const bottomContainer = document.createElement('div');
    bottomContainer.classList.add('bottom-container');
    bottomContainer.append(textContent, cardTypes);

    pokemonCard.append(topContainer, bottomContainer);

    return pokemonCard;
}

// Appends a list of Pokémon cards to the container
async function appendPokemonCard(pokemonList) {
    const fragment = document.createDocumentFragment();
    for (const pokemon of pokemonList) {
        const card = await createPokemonCard(pokemon);
        fragment.appendChild(card);
    }
    DOMElements.container.appendChild(fragment);
}

/* =========================
    Main Functions
   ========================= */

// Loads a batch of Pokémon and appends their cards to the container
async function loadPokemon() {
    if (state.isLoading) return;
    state.isLoading = true;
    setLoading(true);
    // console.time('Load Pokémon Batch'); // Start timing
    const pokemonList = [];
    const maxPokemon = 1025; // Total number of Pokémon
    for (let i = state.currentOffset; i < state.currentOffset + state.batchSize && i <= maxPokemon; i++) {
        // for (let i = state.currentOffset; i <= maxPokemon; i++) {
        try {
            const data = await fetchPokemon(i);
            if (data) {
                state.allPokemon.set(data.name.toLowerCase(), data);
                const dataTypes = data.types.every(t => state.selectedTypes.has(t.type.name));
                if (state.selectedTypes.size === 0 || dataTypes) {
                    pokemonList.push(data);
                }
            }
        } catch (e) {
            console.error(`Failed to load Pokémon with ID ${i}`, e);
        }
    }
    await appendPokemonCard(pokemonList);
    state.currentOffset += state.batchSize;
    state.isLoading = false;
    setLoading(false);

    // console.timeEnd('Load Pokémon Batch');
}

// Filters the displayed Pokémon based on the search query
async function searchAndFilterPokemon(query) {
    const queryToLowerCase = query.trim().toLowerCase();
    clearContainer();

    if (query === '') {
        state.isSearchMode = false;
        appendPokemonCard(Array.from(state.allPokemon.values()));
        return;
    }
    state.isSearchMode = true;
    const pokemon = state.allPokemon.get(queryToLowerCase);

    if (pokemon) {
        appendPokemonCard([pokemon]);
    } else if (state.allPokemonNames.includes(queryToLowerCase)) {
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

    const filteredPokemonNames = state.allPokemonNames.filter(name => {
        const normalizedName = name.toLowerCase().replace(/\s+/g, '');
        return normalizedName.startsWith(normalizedQuery);
    });

    for (const name of filteredPokemonNames.slice(0, 5)) {
        const displayName = getDisplayName(name);
        const apiName = NAME_CORRECTIONS[displayName] || name.toLowerCase();

        const suggestion = document.createElement('div');
        suggestion.classList.add('suggestion');
        suggestion.textContent = displayName;
        suggestion.addEventListener('click', () => {
            DOMElements.searchBar.value = displayName;
            state.selectedPokemonApiName = apiName;
            clearSuggestionsContainer();
        });
        DOMElements.suggestionsContainer.appendChild(suggestion);
    }
}

async function populateAbilitiesDropdown() {
    const abilities = await fetchAbilities();
    const sortedAbilities = abilities.sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: 'base' })
    );
    sortedAbilities.forEach(ability => {
        const option = document.createElement('option');
        option.value = ability;
        option.textContent = capitalizeName(ability);
        DOMElements.abilitiesDropdown.appendChild(option);
    })
};

function applyAllFilters() {
    clearContainer();
    let filteredPokemon = Array.from(state.allPokemon.values());

    // Apply the Ability Filter
    const selectedAbility = DOMElements.abilitiesDropdown.value;
    if (selectedAbility) {
        filteredPokemon = filteredPokemon.filter(pokemon =>
            pokemon.abilities.some(a => a.ability.name === selectedAbility)
        )
    }

    // Apply the Type Filter
    const filterMode = document.querySelector('input[name="filterMode"]:checked')?.value;
    const selectedFirstTypes = Array.from(state.selectedTypes);
    const selectedSecondTypes = Array.from(state.selectedSecondTypeSet || []);

    if (selectedFirstTypes.length > 0) {
        if (filterMode === 'double' && !selectedSecondTypes.length) {
            selectSecondTypeMessage();
            return;
        };

        const filterFunctions = {
            any: (pokemon) => filterByAnyType(pokemon, selectedFirstTypes),
            double: (pokemon) => filterByDoubleType(pokemon, selectedFirstTypes, selectedSecondTypes),
            single: (pokemon) => filterBySingleType(pokemon, selectedFirstTypes)
        };

        const filterFunction = filterFunctions[filterMode];
        if (filterFunction) {
            filteredPokemon = filteredPokemon.filter(filterFunction)
        } else {
            console.error(`Unknown filter mode: ${filterMode}`);
        }
    }

    if (filteredPokemon.length > 0) {
        appendPokemonCard(filteredPokemon);
    } else {
        displayNoResultsMessage();
    }
}

// Debounced version of showSuggestions to limit the rate of firing
const debouncedShowSuggestions = debounce(showSuggestions, 300);

/* =========================
    Event Listeners
   ========================= */

// Event listener for search bar input
DOMElements.searchBar.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    debouncedShowSuggestions(query);
});

DOMElements.searchBar.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        searchButtonFunction()
    }
})

// Event listener for search button click
DOMElements.searchButton.addEventListener('click', searchButtonFunction);

// Event listener for clear button click
DOMElements.clearButton.addEventListener('click', () => {
    DOMElements.searchBar.value = '';
    clearSuggestionsContainer();
    state.isSearchMode = false;
    state.selectedPokemonApiName = '';
    searchAndFilterPokemon('');
});

DOMElements.typeCheckboxes.addEventListener('change', (e) => {
    if (e.target.classList.contains('type-filter')) {
        const type = e.target.value;
        if (e.target.checked) {
            state.selectedTypes.add(type);
            console.log(state.selectedTypes);
        } else {
            state.selectedTypes.delete(type);
            console.log(state.selectedTypes);
        }
    }
});

DOMElements.secondTypeCheckboxes.addEventListener('change', (e) => {
    if (e.target.classList.contains('second-type-filter')) {
        const checkbox = e.target;
        if (checkbox.checked) {
            state.selectedSecondTypeSet.add(checkbox.value);
            console.log(state.selectedSecondTypeSet);
        } else {
            state.selectedSecondTypeSet.delete(checkbox.value);
            console.log(state.selectedSecondTypeSet);
        }
    }
})

DOMElements.applyFilters.addEventListener('click', applyAllFilters);

// Event Listener for Radio Buttons
DOMElements.filterRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        const selectedValue = document.querySelector('input[name="filterMode"]:checked').value;

        // Show/Hide the second type checkboxes based on the selected filter mode
        if (selectedValue === 'double') {
            DOMElements.secondTypeCheckboxes.style.display = 'block';
        } else {
            DOMElements.secondTypeCheckboxes.style.display = 'none';
        }
    })
})

// Infinite scroll to load more Pokémon when the user scrolls near the bottom of the page
window.addEventListener('scroll', debounce(() => {
    if (state.isSearchMode || state.isLoading) return;
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
        loadPokemon();
    }
}, 200));

// Initial load of Pokémon names and the first batch of Pokémon data
document.addEventListener('DOMContentLoaded', async () => {
    state.allPokemonNames.push(...await fetchAllPokemonNames());
    populateAbilitiesDropdown();
    loadPokemon();
});

