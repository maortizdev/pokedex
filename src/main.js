const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';
const ENDPOINTS = {
    pokemon: (identifier) => `${POKEAPI_BASE_URL}/pokemon/${identifier}`,
};
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
}

const searchInput = document.querySelector('.search-input');
const searchBtn = document.querySelector('#search-btn');
const pokemonDisplay = document.querySelector('#pokemon-display');
const errorMessage = document.querySelector('#error-message');

const displayPokemon = (pokemon) => {
    pokemonDisplay.textContent = `${pokemon.id}. ${pokemon.name}`;
};

const displayError = () => {
    errorMessage.textContent = 'Pokemon not found. Please try again.';
    pokemonDisplay.textContent = '';
};

const normalizePokemonName = (input) => {
    const trimmed = input.trim().toLowerCase();

    // Remove ALL spaces, hyphens, special characters for comparison
    const normalized = trimmed.replace(/[\s\-':\.♀♂]/g, '');

    console.log(`Input: ${input}`);
    console.log(`Normalized: ${normalized}`);

    // Check if normalized version matches a correction key
    for (const [key, value] of Object.entries(NAME_CORRECTIONS)) {
        const keyNormalized = key.toLowerCase().trim().replace(/[\s\-':\.♀♂]/g, '');
        console.log(`Checking: ${keyNormalized} '===' ${normalized}`);
        if (keyNormalized === normalized) {
            console.log(`Found match! Returning: ${value}`);
            return value;
        }
    }
    // If no match found, apply standard normalization
    return trimmed
        .replace(/\s+/g, '-')
        .replace(/[':\.♀♂]/g, '');
};

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

const fetchPokemon = async () => {
    const query = normalizePokemonName(searchInput.value);

    console.log(`Query result: ${query}`);
    console.log(`Full URL:${ENDPOINTS.pokemon(query)}`);

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

searchBtn.addEventListener('click', fetchPokemon);

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') fetchPokemon();
});