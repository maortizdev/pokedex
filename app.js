// Ability Filter
// TODO: Work on abilities filter
// state.selectedAbility already declared
// TODO: Fetch and Populate Abilities.
// Create an async function to fetch and populate abilities in a dropdown
// fetch abilities endpoint
// data.results.map(ability => abiltiy.name):[]
// create an async funciton populateAbilitiesdropdown
// create a dropdown element in html id abilities-dropdown
// abilities = await fetchallbao
// for each abiltiy => .option createelement => value ability => textcontent cpaitlaizename(ability) => appendchild option
// TODO: Filter pokemon by abilities
// use the abilities array in each pokemons data to filter them
// filterByAbility function(pokemon, selectedAbility) .some => === selectedAbility

/* =========================
    Constants
   ========================= */
const POKE_API_BASE = 'https://pokeapi.co/api/v2';
const ENDPOINTS = {
    pokemon: (id) => `${POKE_API_BASE}/pokemon/${id}`, // Endpoint to fetch a specific Pokémon by ID
    species: (id) => `${POKE_API_BASE}/pokemon-species/${id}`, // Endpoint to fetch a specific Pokémon species by ID
    types: (name) => `${POKE_API_BASE}/type/${name}`, // Endpoint to fetch a specific type by name
    allPokemon: () => `${POKE_API_BASE}/pokemon?limit=1000` // Endpoint to fetch all Pokémon names
};

/* =========================
    Name Corrections
   ========================= */
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
const DOMElements = {
    container: document.querySelector('#pokemon-container'),
    suggestionsContainer: document.querySelector('#suggestions-container'),
    searchBar: document.querySelector('#search-bar'),
    searchButton: document.querySelector('#search-button'),
    clearButton: document.querySelector('#clear-button'),
    applyFilters: document.querySelector('#apply-filters'),
    filterRadios: document.querySelectorAll('input[name="filterMode"]'),
    typeCheckboxes: document.querySelector('#type-checkboxes'),
    secondTypeCheckboxes: document.querySelector('#second-type-checkboxes')
};

/* =========================
    State Variables
   ========================= */
const state = {
    allPokemon: new Map(), // Map to store loaded Pokémon data
    allPokemonNames: [], // Array to store all Pokémon names
    selectedTypes: new Set(),
    selectedSecondTypeSet: new Set(),
    batchSize: 1025,
    currentOffset: 1,
    isSearchMode: false,
    isLoading: false,
    selectedPokemonApiName: "",
    selectedAbility: null
};

/* =========================
    Fetch Functions
   ========================= */

// Fetch data boilerplate
async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch data from ${url}`);
        return await response.json();
    } catch (error) {
        console.error(error)
    }
};

// Fetch Pokémon data from the PokeAPI Pokemon endpoint
function fetchPokemon(id) {
    return fetchData(ENDPOINTS.pokemon(id));
};

// Fetch Pokémon Species data from the PokeAPI Pokemon endpoint
function fetchPokemonSpecies(id) {
    return fetchData(ENDPOINTS.species(id));
};

// Fetch Pokémon data from the PokeAPI Pokemon endpoint
async function fetchAllPokemonNames() {
    const data = await fetchData(ENDPOINTS.allPokemon());
    return data ? data.results.map(pokemon => pokemon.name) : [];
};

/* =========================
    Utility Functions
   ========================= */
function capitalizeName(name) {
    return name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function getDisplayName(apiName) {
    return NAME_CORRECTIONS[apiName] || capitalizeName(apiName);
}

// Debounce function to limit the rate at which a function can fire
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

function filterByAnyType(pokemon, selectedFirstTypes) {
    return selectedFirstTypes.some(type => pokemon.types.some(t => t.type.name === type))
}

function filterByDoubleType(pokemon, selectedFirstTypes, selectedSecondTypes) {
    return pokemon.types.length === 2 &&
        selectedFirstTypes.some(type => pokemon.types.some(t => t.type.name === type)) &&
        selectedSecondTypes.some(type => pokemon.types.some(t => t.type.name === type))
}
function filterBySingleType(pokemon, selectedFirstTypes) {
    return pokemon.types.length === 1 && // Filter pokemon with only one type
        selectedFirstTypes.includes(pokemon.types[0].type.name)
}

/* =========================
    DOM Manipulation Functions
   ========================= */

// Clears the Pokémon container
function clearContainer() {
    DOMElements.container.innerHTML = '';
}

// Clears the suggestions container
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
    selectSecondTypeMessage.textContent = 'Please, select second type.';
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

async function filterPokemonByTypes() {
    clearContainer();

    const filterMode = document.querySelector('input[name="filterMode"]:checked').value;
    const selectedFirstTypes = Array.from(state.selectedTypes);
    const selectedSecondTypes = Array.from(state.selectedSecondTypeSet || []);

    let filteredPokemonList = [];

    // If no types are selected, show all pokemon
    if (selectedFirstTypes.length === 0) {
        await appendPokemonCard(Array.from(state.allPokemon.values()));
        return;
    }

    switch (filterMode) {
        case 'any':
            filteredPokemonList = Array.from(state.allPokemon.values()).filter(pokemon =>
                filterByAnyType(pokemon, selectedFirstTypes));
            break;
        case 'double':
            if (selectedSecondTypes.length === 0) {
                selectSecondTypeMessage();
                return;
            }
            filteredPokemonList = Array.from(state.allPokemon.values()).filter(pokemon =>
                filterByDoubleType(pokemon, selectedFirstTypes, selectedSecondTypes));
            break;
        case 'single':
            filteredPokemonList = Array.from(state.allPokemon.values()).filter(pokemon =>
                filterBySingleType(pokemon, selectedFirstTypes));
            break;
        default:
            console.error(`Unknown filter mode: ${filterMode}`);
            return;
    }

    try {
        if (filteredPokemonList.length > 0) {
            filteredPokemonList.sort((a, b) => a.id - b.id);
            // loadFilteredPokemonBatch();
            await appendPokemonCard(filteredPokemonList)
        } else {
            displayNoResultsMessage();
        }
    } catch (error) {
        console.error('Error while filtering Pokémon:', error);
    }
}

// async function loadFilteredPokemonBatch() {
// const filteredPokemonOffset = 0;
//     // if (isLoading) return;
//     state.isLoading = true;
//     setLoading(true);

//     const batch = filteredPokemonList.slice(filteredPokemonOffset, filteredPokemonOffset + state.batchSize);
//     await appendPokemonCard(batch);
//     filteredPokemonOffset += state.batchSize;

//     state.isLoading = false;
//     setLoading(false);
// }


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

DOMElements.applyFilters.addEventListener('click', filterPokemonByTypes);

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
    loadPokemon();
});

