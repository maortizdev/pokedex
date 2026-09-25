// ==============================
//           CONSTANTS
// ============================== 

const API_BASE = 'https://pokeapi.co/api/v2';
const TOTAL_POKEMON = 1025;
const BATCH_SIZE = 50;
const ENDPOINTS = {
    pokemon: (id) => `${API_BASE}/pokemon/${id}`
};

const allPokemon = [];
let visiblePokemon = [];

console.log(allPokemon);

const DISPLAY_NAME_OVERRIDES = {
    'nidoran-f': 'Nidoran♀', // 29
    'nidoran-m': 'Nidoran♂', // 32
    'farfetchd': "Farfetch'd", //83
    'mr-mime': 'Mr. Mime', // 122
    'ho-oh': 'Ho-Oh', // 250
    'mime-jr': 'Mime Jr.', // 439
    'porygon-z': 'Porygon-Z', // 474
    'flabebe': 'Flabébé', // 669
    'type-null': 'Type: Null', // 772
    'jangmo-o': 'Jangmo-o', // 782
    'hakamo-o': 'Hakamo-o', // 783
    'kommo-o': 'Kommo-o', // 784
    'sirfetchd': "Sirfetch'd", // 865
    'mr-rime': 'Mr. Rime', // 866
};

const SEARCH_KEY_MAP = {
    '♀': 'f',
    '♂': 'm',
};

// ==============================
//         DOM REFERENCES
// ==============================

const loadingScreen = document.querySelector('#loading-screen');
const loadingProgress = document.querySelector('#loadingProgress');
const pokemonGrid = document.querySelector('#pokemon-grid');
const pokemonList = document.querySelector('#pokemon-list');
const searchInput = document.querySelector('#search-input');

// ==============================
//           UTILITIES
// ==============================

const toDisplayName = (speciesName) => {
    if (DISPLAY_NAME_OVERRIDES[speciesName]) return DISPLAY_NAME_OVERRIDES[speciesName];
    return speciesName
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}


const toSearchKey = (str) => {
    return str
        .toLowerCase()
        .replace(/[♀♂]/g, (char) => SEARCH_KEY_MAP[char])
        .replace(/\bfemale\b/g, 'f')
        .replace(/\bmale\b/g, 'm')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '')
}

// ==============================
//           FETCH FUNCTIONS
// ==============================

const fetchData = async (url) => {
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status} = ${url}`);
        return res.json();
    } catch (err) {
        console.error(`Error fetching data from ${url}:`, err);
        throw err;
    }
};

// const fetchAllPokemon = async () => {
//     const data = await fetchData(`${API_BASE}/pokemon?limit=${TOTAL_POKEMON}`);
//     console.log(data.results);
//     return data.results;
// };

const fetchPokemon = async (id) => {
    const data = await fetchData(ENDPOINTS.pokemon(id));
    return {
        id: data.id,
        name: data.name,
        speciesName: data.species.name,
        searchKey: toSearchKey(data.species.name)
    };
};

// ==============================
//           RENDERING
// ==============================

const renderCard = (pokemon) => {
    const pokemonName = document.createElement('li');
    pokemonName.textContent = toDisplayName(pokemon.speciesName);
    pokemonList.appendChild(pokemonName);
    return pokemonName;
};

// ==============================
//           FEATURES
// ==============================
const handleSearchInput = (e) => {
    const query = toSearchKey(e.target.value);
    pokemonList.innerHTML = '';
    visiblePokemon = allPokemon.filter(pokemon => pokemon.searchKey.includes(query));

    console.log(visiblePokemon.length);
    visiblePokemon.forEach(pokemon => renderCard(pokemon));
};

// ==============================
//        LOADING POKEMON
// ==============================

const loadPokemon = async () => {
    for (let i = 1; i <= TOTAL_POKEMON; i++) {
        let fetchedPokemon = await fetchPokemon(i);
        allPokemon.push(fetchedPokemon);
    }
    visiblePokemon = allPokemon;
    visiblePokemon.forEach(pokemon => renderCard(pokemon))
};

// ==============================
//        EVENT LISTENERS
// ==============================

searchInput.addEventListener('input', handleSearchInput);

// ==============================
//          EXECUTABLES
// ==============================

loadPokemon();
