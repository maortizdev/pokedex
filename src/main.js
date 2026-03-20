// ========== API CONFIGURATION ==========
const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';
// Dynamic endpoint builder for fetching individual Pokemon
const ENDPOINTS = {
    pokemonSpecies: (identifier) => `${POKEAPI_BASE_URL}/pokemon-species/${identifier}`,
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
    "Chi-Yu": "chi-yu",

    // Paradox Pokémon
    "Great Tusk": "great-tusk",
    "great tusk": "great-tusk",
    "greattusk": "great-tusk",

    "Scream Tail": "scream-tail",
    "scream tail": "scream-tail",
    "screamtail": "scream-tail",

    "Brute Bonnet": "brute-bonnet",
    "brute bonnet": "brute-bonnet",
    "brutebonnet": "brute-bonnet",

    "Flutter Mane": "flutter-mane",
    "flutter mane": "flutter-mane",
    "fluttermane": "flutter-mane",

    "Slither Wing": "slither-wing",
    "slither wing": "slither-wing",
    "slitherwing": "slither-wing",

    "Sandy Shocks": "sandy-shocks",
    "sandy shocks": "sandy-shocks",
    "sandyshocks": "sandy-shocks",

    "Roaring Moon": "roaring-moon",
    "roaring moon": "roaring-moon",
    "roaringmoon": "roaring-moon",

    "Iron Hands": "iron-hands",
    "iron hands": "iron-hands",
    "ironhands": "iron-hands",

    "Iron Jugulis": "iron-jugulis",
    "iron jugulis": "iron-jugulis",
    "iranjugulis": "iron-jugulis",

    "Iron Thorns": "iron-thorns",
    "iron thorns": "iron-thorns",
    "ironthorns": "iron-thorns",

    "Iron Bundle": "iron-bundle",
    "iron bundle": "iron-bundle",
    "ironbundle": "iron-bundle",

    "Iron Moth": "iron-moth",
    "iron moth": "iron-moth",
    "ironmoth": "iron-moth",

    "Iron Treads": "iron-treads",
    "iron treads": "iron-treads",
    "irontreads": "iron-treads",

    "Iron Valiant": "iron-valiant",
    "iron valiant": "iron-valiant",
    "ironvaliant": "iron-valiant",

    "Walking Wake": "walking-wake",
    "walking wake": "walking-wake",
    "walkingwake": "walking-wake",

    "Gouging Fire": "gouging-fire",
    "gouging fire": "gouging-fire",
    "gougingfire": "gouging-fire",

    "Raging Bolt": "raging-bolt",
    "raging bolt": "raging-bolt",
    "ragingbolt": "raging-bolt",

    "Iron Boulder": "iron-boulder",
    "iron boulder": "iron-boulder",
    "ironboulder": "iron-boulder",

    "Iron Crown": "iron-crown",
    "iron crown": "iron-crown",
    "ironcrown": "iron-crown",

    "Iron Leaves": "iron-leaves",
    "Iron leaves": "iron-leaves",
    "ironleaves": "iron-leaves",

    "Tapu Koko": "tapu-koko",
    "Tapu koko": "tapu-koko",
    "tapukoko": "tapu-koko",

    "Tapu Lele": "tapu-lele",
    "Tapu lele": "tapu-lele",
    "tapulele": "tapu-lele",

    "Tapu Bulu": "tapu-bulu",
    "Tapu bulu": "tapu-bulu",
    "tapubulu": "tapu-bulu",

    "Tapu Fini": "tapu-fini",
    "Tapu fini": "tapu-fini",
    "tapufini": "tapu-fini",

    "Porygon2": "porygon2",
    "Porygon 2": "porygon2",
    "porygon 2": "porygon2",
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

    errorMessage.textContent = '';

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
    // Clear the pokemon display info
    document.querySelector('#pokemon-name').textContent = '';
    document.querySelector('#pokemon-number').textContent = '';
    document.querySelector('#pokemon-image').src = '';
    document.querySelector('#pokemon-types').innerHTML = '';
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

// ========== SPECIES LOOKUP (NEW) ==========
// Fetches from pokemon-species endpoint and gets the default form name
const getDefaultPokemonForm = async (speciesName) => {
    try {
        const speciesData = await fetchData(ENDPOINTS.pokemonSpecies(speciesName));

        // Find the default variety
        const defaultVariety = speciesData.varieties.find(variety => variety.is_default);

        if (!defaultVariety) {
            throw new Error('No default variety found');
        }

        // Extract the pokemon name from the variety URL
        // URL format: https://pokeapi.co/api/v2/pokemon/shaymin-land/
        const pokemonName = defaultVariety.pokemon.name;

        console.log(`Species: ${speciesName} → Default form: ${pokemonName}`);
        return pokemonName;
    } catch (error) {
        console.error(`Error fetching species: ${speciesName}`, error);
        throw error;
    }
};

// ========== MAIN SEARCH HANDLER ==========
const fetchPokemon = async () => {
    const query = normalizePokemonName(searchInput.value);

    console.log(`Query result: ${query}`);

    // Prevent API call with empty search
    if (!query) {
        displayError();
        return;
    }

    try {
        errorMessage.textContent = ''; // Clear previous errors

        // Step 1: Get the default form from pokemon-species endpoint
        const defaultForm = await getDefaultPokemonForm(query);

        // Step 2: Fetch the actual pokemon data using the default form name
        const data = await fetchData(ENDPOINTS.pokemon(defaultForm));

        displayPokemon(data);
        console.log(data);
    } catch (error) {
        displayError();
        return;
    }
};

// ========== EVENT LISTENERS ==========
searchBtn.addEventListener('click', fetchPokemon);

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') fetchPokemon();
});