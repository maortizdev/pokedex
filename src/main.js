const API_BASE = "https://pokeapi.co/api/v2";
const TOTAL_POKEMON = 1025;
const BATCH_SIZE = 50;
const ENDPOINTS = {
    pokemon: (identifier) => `${API_BASE}/pokemon/${identifier}`,
};

// ==============================
// DOM REFERENCES
// ==============================

const loadingScreen = document.querySelector('#loading-screen');
const loadingProgress = document.querySelector('#loading-progress');
const errorScreen = document.querySelector('#error-screen');
const appShell = document.querySelector('#app');

// ==============================
// State
// ==============================

// NEVER mutate directly 
const state = {
    // --- Data ------------------------------
    allPokemon: [],         // Full list of all Pokemon at startup. NEVER mutated after load
    // --- Search ------------------------------
    searchDraft: '',        // Current value of the search input
    activeSearch: '',       // The confirmed search term the pipeline runs against
    // --- Filters ------------------------------
    draftFilters: {         // Filters currently selected but not yet applied
        types: [],
        typeMode: 'normal', // normal | single | dual 
        generations: [],    // any selected generations (OR logic)
        statuses: [],       // legendary | myhtical | baby (OR logic)
    },
    appliedFilters: {       // The confirmed filters the pipeline runs against
        types: [],
        typeMode: 'normal', // normal | 'single' | 'dual'
        generations: [],
        statuses: [],
    },
    // --- Sort ------------------------------
    sort: {
        by: 'id',           // id | name | height | weight
        direction: 'asc',   // asc | desc
    },
    // --- Pippeline output ------------------------------
    visiblePokemon: [],     // The final list of Pokemon that match the active search + filters, sorted and ready to render
    renderedSubset: [],     // The subset of visiblePokemon currently rendered on screen (for infinite scroll)
    // --- Modal ------------------------------
    modal: {
        isOpen: false,      // Whether the modal is currently open
        currentIndex: null,
    }
};

// ==============================
// State Setters
// ==============================

// --- Data ------------------------------
const setAllPokemon = (pokemonArray) => {
    state.allPokemon = pokemonArray;
};

// --- Search ------------------------------
const setSearchDraft = (value) => {
    state.searchDraft = value;
};

const applySearch = () => {
    state.activeSearch = state.searchDraft;
};

// --- Filters ------------------------------
const setDraftTypes = (types) => {
    state.draftFilters.types = types;
};

const setDraftTypeMode = (mode) => {
    state.draftFilters.typeMode = mode;
};

const setDraftGenerations = (generations) => {
    state.draftFilters.generations = generations;
};

const setDraftStatuses = (statuses) => {
    state.draftFilters.statuses = statuses;
};

const applyFilters = () => {
    state.appliedFilters = {
        types: [...state.draftFilters.types],
        typeMode: state.draftFilters.typeMode,
        generations: [...state.draftFilters.generations],
        statuses: [...state.draftFilters.statuses],
    };
};

// --- Sort ------------------------------
const setSort = (by, direction) => {
    state.sort.by = by;
    state.sort.direction = direction;
};

// ---Pipeline output ------------------------------
const setVisiblePokemon = (pokemonArray) => {
    state.visiblePokemon = pokemonArray;
};

const setRenderedSubset = (pokemonArray) => {
    state.renderedSubset = pokemonArray;
};

const appendRenderedSubset = (pokemonArray) => {
    state.renderedSubset = [...state.renderedSubset, ...pokemonArray];
};

// --- Modal ------------------------------
const openModal = (indexInVisible) => {
    state.modal.isOpen = true;
    state.modal.currentIndex = indexInVisible;
};

const closeModal = () => {
    state.modal.isOpen = false;
    state.modal.currentIndex = null;
};

const modalNext = () => {
    if (state.modal.currentIndex === null) return;
    state.modal.currentIndex =
        (state.modal.currentIndex + 1) %
        state.visiblePokemon.length;
};

const modalPrev = () => {
    if (state.modal.currentIndex === null) return;
    state.modal.currentIndex =
        (state.modal.currentIndex - 1 + state.visiblePokemon.length) %
        state.visiblePokemon.length;
};

// --- Reset ------------------------------
const resetAll = () => {
    state.searchDraft = '';
    state.activeSearch = '';
    state.draftFilters = { types: [], typeMode: 'normal', generations: [], statuses: [] };
    state.appliedFilters = { types: [], typeMode: 'normal', generations: [], statuses: [] };
    state.sort = { by: 'id', direction: 'asc' };
    state.visiblePokemon = [];
    state.renderedSubset = [];
    state.modal = { isOpen: false, currentIndex: null };
};

// --- Debug ------------------------------
const logState = () => {
    console.log('[State]', JSON.parse(JSON.stringify(state)));
};

// ==============================
//  Pipeline
// ==============================

// Filters allPokemon by activeSearch (greedy substring, case-insensitive)
// Empty search passes everything through
const searchPokemon = (pokemon) => {
    const term = state.activeSearch.trim().toLowerCase();
    if (!term) return pokemon;
    return pokemon.filter((p) =>
        p.name.toLowerCase().includes(term) ||
        p.speciesName.toLowerCase().includes(term));
};

// Filter by appliedFilters
// Each filter group is optional
// Between groups: AND
// Within types: AND
// Within generations/statuses: OR
const filterPokemon = (pokemon) => {
    const { types, typeMode, generations, statuses } = state.appliedFilters;

    return pokemon.filter((p) => {

        // Type filter: depends on selected mode
        let passesTypes = true;
        if (types.length > 0) {
            if (typeMode === 'normal') {
                passesTypes = types.some((t) => p.types.includes(t));

            } else if (typeMode === 'single') {
                passesTypes = p.types.length === 1 && types.includes(p.types[0]);

            } else if (typeMode === 'dual') {
                passesTypes =
                    types.length === 2 &&
                    p.types.length === 2 &&
                    types.every((t) => p.types.includes(t));
            };
        };

        // Generation filter: pokemon must match ANY selected generation (OR logic)
        const passesGenerations =
            generations.length === 0 ||
            generations.includes(p.generation);

        // Status filter: pokemon must match ANY selected status (OR logic)
        const passesStatuses =
            statuses.length === 0 ||
            (statuses.includes('legendary') && p.isLegendary) ||
            (statuses.includes('mythical') && p.isMythical) ||
            (statuses.includes('baby') && p.isBaby);

        return passesTypes && passesGenerations && passesStatuses;
    });
};

// Sorts the pokemon array by state.sort.by and stat.sort.direction
// Spread into a new array first because sort() mutates
const sortPokemon = (pokemon) => {
    const { by, direction } = state.sort;
    const multiplier = direction === 'asc' ? 1 : -1;

    return [...pokemon].sort((a, b) => {
        if (by === 'name') {
            return multiplier * a.name.localeCompare(b.name);
        }
        return multiplier * (a[by] - b[by]); // id | height | weight
    });
};

// Master pipeline function - chains search -> filter -> sort
// then updates state.visiblePokemon with the result.
const runPipeline = () => {
    const searched = searchPokemon(state.allPokemon);
    const filtered = filterPokemon(searched);
    const sorted = sortPokemon(filtered);
    setVisiblePokemon(sorted);
    console.log(`[Pipeline] visiblePokemon: ${sorted.length} / ${state.allPokemon.length}`);
};

// ==============================
// LOADING / ERROR UI HELPERS
// ==============================

const updateProgress = (loaded, total) => {
    loadingProgress.textContent = `${loaded} / ${total}`;
};

const hideLoadingScreen = () => {
    loadingScreen.hidden = true;
};

const showError = (message = 'Something went wrong. Please refresh the page.') => {
    hideLoadingScreen();
    errorScreen.hidden = false;
    errorScreen.querySelector('#error-message').textContent = message;
};

const getIdFromUrl = (url) => {
    const parts = url.split('/');
    return parts[parts.length - 2];
};

// 
// ==============================
// Fetch Functions
// ==============================

// Fetches the URL, checks if the response was successful, returns the data
// Why: Single reusable base for all API calls — every other fetch function uses this
const fetchData = async (url) => {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status} = ${url}`);
        return response.json();
    } catch (error) {
        console.error(`Error fetching data from ${url}:`, error);
        throw error;
    }
};

// Fetches the full list of all Pokemon from the API
// Why: This gives us the name and URL for every Pokemon before we start batch fetching details
const fetchPokemonList = async () => {
    const data = await fetchData(`${API_BASE}/pokemon?limit=${TOTAL_POKEMON}`);
    return data.results;
};

// Fetches and normalizes a single Pokemon's details
// Why: We use the API - provided URL directly instead of constructing it ourselves,
// which is more reliable.We store both the raw API name and the clean species
// name to handle forms like "giratina-altered" vs "giratina"
const fetchPokemon = async (id) => {
    const data = await fetchData(ENDPOINTS.pokemon(id));
    return {
        id: data.id,
        name: data.name,
        speciesName: data.species.name,
        types: data.types.map((t) => t.type.name),
        artwork: data.sprites.other['official-artwork'].front_default,
        sprite: data.sprites.front_default,
        height: data.height,
        weight: data.weight,
    };
};

// Fetches a batch of Pokemon in parallel, retries failed ones once
// Why: Parallel fetching is much faster than one by one. Promise.allSettled is used
// instead of Promise.all because it never throws — it lets us handle partial
// failures gracefully instead of the whole batch failing on one bad request

const fetchBatch = async (ids, retrying = false) => {
    try {
        const promises = ids.map((id) => fetchPokemon(id));
        const results = await Promise.allSettled(promises);

        const successful = [];
        const failed = [];

        results.forEach((result, index) => {
            if (result.status === "fulfilled") {
                successful.push(result.value);
            } else {
                failed.push(ids[index]);
            }
        });
        if (failed.length > 0 && !retrying) {
            const retryResults = await fetchBatch(failed, true);
            return [...successful, ...retryResults];
        }

        return successful;
    } catch (error) {
        if (!retrying) return await fetchBatch(ids, true);
        return [];
    }
};

// ==============================
// Load All Pokemon
// =============================

const loadAllPokemon = async () => {
    try {
        updateProgress(0, TOTAL_POKEMON);
        const pokemonList = await fetchPokemonList();

        const batches = [];
        for (let i = 0; i < pokemonList.length; i += BATCH_SIZE) {
            batches.push(pokemonList.slice(i, i + BATCH_SIZE));
        }

        const buffer = [];
        let loaded = 0;
        for (const batch of batches) {
            const ids = batch.map((pokemon) => getIdFromUrl(pokemon.url));
            const results = await fetchBatch(ids);
            buffer.push(...results);
            loaded += results.length;
            updateProgress(loaded, TOTAL_POKEMON);
        }

        buffer.sort((a, b) => a.id - b.id);
        setAllPokemon(buffer);
        runPipeline();
        hideLoadingScreen();
        logState();
    } catch (error) {
        showError('Failed to load Pokemon data. Please refresh the page.');
        console.error(error);
    }
};

loadAllPokemon();