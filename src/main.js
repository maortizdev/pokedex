// ========== API CONFIGURATION ==========
const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';
// Dynamic endpoint builder for fetching individual Pokemon
const ENDPOINTS = {
    pokemon: (identifier) => `${POKEAPI_BASE_URL}/pokemon/${identifier}`,
};

// Maps display names to API-compatible names
// Why: PokeAPI uses hyphens and lowercase (e.g., "type-null")
// But pokemon have special characters in official names (e.g., "Type: Null", "Mr. Mime", "Nidoran♀")
const NAME_CORRECTIONS = {
    "Ho-Oh": "ho-oh",
    "Farfetch'd": "farfetchd",
    "Sirfetch'd": "sirfetchd",
    "Type: Null": "type-null",
    "Mr. Mime": "mr-mime",
    "Mr. Rime": "mr-rime",
    "Mime Jr.": "mime-jr",
    "Porygon-Z": "porygon-z",
    "Jangmo-o": "jangmo-o",
    "Hakamo-o": "hakamo-o",
    "Kommo-o": "kommo-o",
    "Nidoran♀": "nidoran-f",
    "Nidoran♂": "nidoran-m",
    "Nidoranf": "nidoran-f",
    "Nidoranm": "nidoran-m",
    "Flabébé": "flabebe",
    "Wo-Chien": "wo-chien",
    "Chien-Pao": "chien-pao",
    "Ting-Lu": "ting-lu",
    "Chi-Yu": "chi-yu"
};

// Reverse mapping: converts API names back to display names
// Why: PokeAPI returns "mr-mime", but we want to show "Mr. Mime"
const DISPLAY_NAMES = Object.entries(NAME_CORRECTIONS).reduce((acc, [display, api]) => {
    acc[api] = display;
    return acc;
}, {});

// ========== DOM ELEMENTS ==========
const searchInput = document.querySelector('.search-input');
const searchBtn = document.querySelector('#search-btn');
const pokemonDisplay = document.querySelector('#pokemon-display');
const errorMessage = document.querySelector('#error-message');

// ========== DISPLAY FUNCTIONS ==========
const displayPokemon = (pokemon) => {
    // Get display name (proper format like "Mr. Mime") or fallback to API name
    const displayName = DISPLAY_NAMES[pokemon.name] || pokemon.name;

    // Update image
    document.querySelector('#pokemon-image').src = pokemon.sprites.other['official-artwork'].front_default;
    document.querySelector('#pokemon-image').alt = displayName;

    // Update name and number
    document.querySelector('#pokemon-name').textContent = displayName;
    document.querySelector('#pokemon-number').textContent = `#${pokemon.id}`;

    // Update types
    const typesContainer = document.querySelector('#pokemon-types');
    typesContainer.innerHTML = '';
    pokemon.types.forEach(typeObj => {
        const typeElement = document.createElement('span');
        typeElement.textContent = typeObj.type.name;
        typeElement.className = 'type-badge';
        typesContainer.appendChild(typeElement);
    });
};

const displayError = () => {
    errorMessage.textContent = 'Pokemon not found. Please try again.';
    pokemonDisplay.textContent = '';
};

// ========== DATA PROCESSING ==========
const normalizePokemonName = (input) => {
    const trimmed = input.trim().toLowerCase();

    // Strip all spaces, hyphens, and special characters for comparison
    // Why: allows flexible matching (user can type "mr mime", "mr-mime", or "Mr. Mime")
    const normalized = trimmed.replace(/[\s\-':\.♀♂]/g, '');

    console.log(`Input: ${input}`);
    console.log(`Normalized: ${normalized}`);

    // Try to match against NAME_CORRECTIONS first
    // Why: some Pokémon require exact mappings that generic normalization can't handle
    for (const [key, value] of Object.entries(NAME_CORRECTIONS)) {
        const keyNormalized = key.toLowerCase().trim().replace(/[\s\-':\.♀♂]/g, '');
        console.log(`Checking: ${keyNormalized} '===' ${normalized}`);
        if (keyNormalized === normalized) {
            console.log(`Found match! Returning: ${value}`);
            return value;
        }
    }

    // Fallback: apply standard normalization if no correction mapping exists
    // Why: handles regular Pokémon names (e.g., "pikachu", "charizard")
    return trimmed
        .replace(/\s+/g, '-')
        .replace(/[':\.♀♂]/g, '');
};

// ========= API CALLS ==========
const fetchData = async (url) => {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch');
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
};

// ========== MAIN SEARCH HANDLER ==========
const fetchPokemon = async () => {
    const query = normalizePokemonName(searchInput.value);

    console.log(`Query result: ${query}`);
    console.log(`Full URL:${ENDPOINTS.pokemon(query)}`);

    // Prevent API call with empty search
    if (!query) {
        displayError();
        return;
    }

    try {
        errorMessage.textContent = '';
        const data = await fetchData(ENDPOINTS.pokemon(query));
        displayPokemon(data);
        console.log(data)
    } catch (error) {
        displayError();
    }
};

// ========== EVENT LISTENERS ==========
searchBtn.addEventListener('click', fetchPokemon);

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') fetchPokemon();
});