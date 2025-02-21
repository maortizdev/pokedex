// TODO: Change pokemon's number to regional based on selected version

/* =========================
    Constants
   ========================= */
// Base URL for PokeAPI
const POKE_API_BASE = 'https://pokeapi.co/api/v2';
// API endpoints for specific data
const ENDPOINTS = {
    pokemon: (name) => `${POKE_API_BASE}/pokemon/${name}`, // Fetch Pokémon by ID
    allPokemon: () => `${POKE_API_BASE}/pokemon?limit=1000`, // Fetch all Pokémon names
    species: (id) => `${POKE_API_BASE}/pokemon-species/${id}`, // Fetch Pokémon species by ID
    types: (name) => `${POKE_API_BASE}/type/${name}`, // Fetch type details by name
    abilities: () => `${POKE_API_BASE}/ability?limit=1000`, // Fetch all abilities
    pokedexes: (id) => `${POKE_API_BASE}/pokedex/${id}`
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

const generationMap = {
    "generation-i": "1",
    "generation-ii": "2",
    "generation-iii": "3",
    "generation-iv": "4",
    "generation-v": "5",
    "generation-vi": "6",
    "generation-vii": "7",
    "generation-viii": "8",
    "generation-ix": "9"
};

const FORM_CORRECTIONS = {
    "deoxys": "deoxys-normal",
    "wormadam": "wormadam-plant",
    "basculin": "basculin-red-striped",
    "darmanitan": "darmanitan-standard",
    "tornadus": "tornadus-incarnate",
    "thundurus": "thundurus-incarnate",
    "landorus": "landorus-incarnate",
    "keldeo": "keldeo-ordinary",
    "meloetta": "meloetta-aria",
    "meowstic": "meowstic-male",
    "aegislash": "aegislash-shield",
    "oricorio": "oricorio-baile",
    "lycanroc": "lycanroc-midday",
    "wishiwashi": "wishiwashi-solo",
    "zygarde": "zygarde-50",
    "minior": "minior-red-meteor",
    "mimikyu": "mimikyu-disguised",
    "pumpkaboo": "pumpkaboo-average",
    "gourgeist": "gourgeist-average",
    "toxtricity": "toxtricity-amped",
    "indeedee": "indeedee-male",
    "morpeko": "morpeko-full-belly",
    "eiscue": "eiscue-ice",
    "oinkologne": "oinkologne-male",
    "maushold": "maushold-family-of-four",
    "squawkabilly": "squawkabilly-green-plumage",
    "dudunsparce": "dudunsparce-two-segment",
    "palafin": "palafin-hero",
    "tatsugiri": "tatsugiri-curly",
    "giratina": "giratina-altered",
    "basculegion": "basculegion-male",
    "enamorus": "enamorus-incarnate",
    "shaymin": "shaymin-land",
    "urshifu": "urshifu-single-strike"
};

const GAME_GROUPS = {
    mainGames: [
        { label: "Red/Blue", value: "red-blue", pokedexId: 2 },
        { label: "Gold/Silver", value: "gold-silver", pokedexId: 3 },
        { label: "Ruby/Sapphire", value: "ruby-sapphire", pokedexId: 4 },
        { label: "Diamond/Pearl", value: "diamond-pearl", pokedexId: 5 },
        { label: "Black/White", value: "black-white", pokedexId: 8 },
        { label: "X/Y", value: "x-y", pokedexId: 12 },
        { label: "Sun/Moon", value: "sun-moon", pokedexId: 16 },
        { label: "Sword/Shield", value: "sword-shield", pokedexId: 27 },
        { label: "Scarlet/Violet", value: "scarlet-violet", pokedexId: 31 }
    ],
    thirdVersions: [
        { label: "Yellow", value: "yellow", pokedexId: 2 },
        { label: "Crystal", value: "crystal", pokedexId: 3 },
        { label: "Emerald", value: "emerald", pokedexId: 4 },
        { label: "Platinum", value: "platinum", pokedexId: 6 }
    ],
    remakes: [
        { label: "FireRed/LeafGreen", value: "firered-leafgreen", pokedexId: 2 },
        { label: "HeartGold/SoulSilver", value: "heartgold-soulsilver", pokedexId: 7 },
        { label: "Omega Ruby/Alpha Sapphire", value: "omega-ruby-alpha-sapphire", pokedexId: 15 },
        { label: "Let's Go Pikachu/Let's Go Eevee", value: "lets-go-pikachu-lets-go-eevee", pokedexId: 26 },
        { label: "Brilliant Diamond/Shining Pearl", value: "brilliant-diamond-shining-pearl", pokedexId: 5 }
    ],
    sequels: [
        { label: "Black 2/White 2", value: "black-2-white-2", pokedexId: 9 },
        { label: "Ultra Sun/Ultra Moon", value: "ultra-sun-ultra-moon", pokedexId: 21 }
    ],
    spinOffs: [
        { label: "Legends: Arceus", value: "legends-arceus", pokedexId: 30 }
    ],
    dlcs: {
        swordShield: [
            { label: "The Isle of Armor", value: "the-isle-of-armor", pokedexId: 28 },
            { label: "The Crown Tundra", value: "the-crown-tundra", pokedexId: 29 }
        ],
        scarletViolet: [
            { label: "The Teal Mask", value: "the-teal-mask", pokedexId: 32 },
            { label: "The Indigo Disk", value: "the-indigo-disk", pokedexId: 33 }
        ]
    }
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
    abilitiesDropdown: document.querySelector('#abilities-dropdown'),
    generationsDropdown: document.querySelector('#generations-dropdown'),
    versionGroupsDropdown: document.querySelector('#version-groups-dropdown')
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
function fetchPokemon(name) {
    const correctedNames = FORM_CORRECTIONS[name] || name;
    return fetchData(ENDPOINTS.pokemon(correctedNames));
};

// Fetch Pokémon species data by ID
function fetchSpecies(id) {
    return fetchData(ENDPOINTS.species(id));
};

// Fetch all abilities
async function fetchAbilities() {
    const data = await fetchData(ENDPOINTS.abilities());
    return data ? data.results.map(abilitiy => abilitiy.name) : [];
};

async function fetchPokedex(id) {
    const data = await fetchData(ENDPOINTS.pokedexes(id));
    return data.pokemon_entries.map(entry => entry.pokemon_species);
}

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
            const pokemon = await fetchPokemon(i);
            const species = await fetchSpecies(i)
            if (pokemon && species) {
                const generation = generationMap[species.generation.name];
                const enrichedPokemon = {
                    ...pokemon,
                    generation,
                }
                state.allPokemon.set(pokemon.name.toLowerCase(), enrichedPokemon);
                const dataTypes = pokemon.types.every(t => state.selectedTypes.has(t.type.name));
                if (state.selectedTypes.size === 0 || dataTypes) {
                    pokemonList.push(enrichedPokemon);
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

function createOptGroup(label, options) {
    const optGroup = document.createElement('optgroup');
    optGroup.label = label;

    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option.value;
        opt.textContent = option.label;
        optGroup.appendChild(opt);
    });
    return optGroup
}

async function populateGenerationsDropdown() {
    const generations = Object.entries(generationMap);

    generations.forEach(([apiName, displayName]) => {
        const option = document.createElement('option');
        option.value = apiName;
        option.textContent = `Generation ${displayName}`
        DOMElements.generationsDropdown.appendChild(option);
    })
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

async function populateVersionGroupsDropdown() {
    DOMElements.versionGroupsDropdown.appendChild(createOptGroup('Main Games', GAME_GROUPS.mainGames));
    DOMElements.versionGroupsDropdown.appendChild(createOptGroup('Third Versions', GAME_GROUPS.thirdVersions));
    DOMElements.versionGroupsDropdown.appendChild(createOptGroup('Sequels', GAME_GROUPS.sequels));
    DOMElements.versionGroupsDropdown.appendChild(createOptGroup('Remakes', GAME_GROUPS.remakes));
    DOMElements.versionGroupsDropdown.appendChild(createOptGroup('Spin Offs', GAME_GROUPS.spinOffs));
    DOMElements.versionGroupsDropdown.appendChild(createOptGroup('Sword/Shield DLC', GAME_GROUPS.dlcs.swordShield));
    DOMElements.versionGroupsDropdown.appendChild(createOptGroup('Scarlet/Violet DLC', GAME_GROUPS.dlcs.scarletViolet));
}

function flattenGameGroups(groups) {
    const flattened = [];

    for (const key in groups) {
        if (Array.isArray(groups[key])) {
            flattened.push(...groups[key]);
        } else if (typeof groups[key] === 'object') {
            for (const subkey in groups[key]) {
                flattened.push(...groups[key][subkey]);
            }
        }
    }
    return flattened;
}

async function handleVersionGroupSelection(selectedVersionGroup) {
    const allGroups = flattenGameGroups(GAME_GROUPS);
    const selectedGroup = allGroups.find(group => group.value === selectedVersionGroup);
    console.log(selectedGroup);

    if (!selectedGroup) return;

    const pokedexId = selectedGroup.pokedexId;
    const pokemonSpecies = await fetchPokedex(pokedexId);
    console.log(selectedGroup.pokedexId);

    const filteredPokemon = [];
    for (const species of pokemonSpecies) {
        try {
            const pokemonDetails = await fetchPokemon(species.name);
            console.log(pokemonDetails);
            filteredPokemon.push(pokemonDetails);
        } catch (error) {
            console.error(`Error fetching Pokémon: ${species.name}`, error);
        }
    }
    clearContainer();
    await appendPokemonCard(filteredPokemon);
}

async function applyAllFilters() {
    clearContainer();
    let filteredPokemon = Array.from(state.allPokemon.values());

    // Apply the Generations Filter
    const selectedGeneration = DOMElements.generationsDropdown.value;
    if (selectedGeneration) {
        filteredPokemon = filteredPokemon.filter(pokemon =>
            pokemon.generation === generationMap[selectedGeneration]
        );
    }

    // Apply the Ability Filter
    const selectedAbility = DOMElements.abilitiesDropdown.value;
    if (selectedAbility) {
        filteredPokemon = filteredPokemon.filter(pokemon =>
            pokemon.abilities.some(a => a.ability.name === selectedAbility)
        )
    }

    // Apply the Version Groups Filter
    const selectedVersionGroup = DOMElements.versionGroupsDropdown.value;
    if (selectedVersionGroup) {
        await handleVersionGroupSelection(selectedVersionGroup);
        return;
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

async function main() {
    state.allPokemonNames.push(...await fetchAllPokemonNames());
    populateGenerationsDropdown();
    populateAbilitiesDropdown();
    populateVersionGroupsDropdown();
    await loadPokemon();
}

// Initial load of Pokémon names and the first batch of Pokémon data
document.addEventListener('DOMContentLoaded', main);
