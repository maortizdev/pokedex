// ==============================
//  Constants
// ==============================

const API_BASE = "https://pokeapi.co/api/v2";
const TOTAL_POKEMON = 1025;
const BATCH_SIZE = 50;
const ENDPOINTS = {
    pokemon: (identifier) => `${API_BASE}/pokemon/${identifier}`
};
const DISPLAY_NAME_MAP = {
    // Special punctuation/symbols
    'mr-mime': 'Mr. Mime',
    'mr-rime': 'Mr. Rime',
    'mime-jr': 'Mime Jr.',
    'type-null': 'Type: Null',
    'farfetchd': "Farfetch'd",
    'sirfetchd': "Sirfetch'd",
    'nidoran-f': 'Nidoran♀',
    'nidoran-m': 'Nidoran♂',
    'flabebe': 'Flabébé',
    'ho-oh': 'Ho-Oh',
    'porygon-z': 'Porygon-Z',
    'jangmo-o': 'Jangmo-o',
    'hakamo-o': 'Hakamo-o',
    'kommo-o': 'Kommo-o',

    // Tapu
    'tapu-koko': 'Tapu Koko',
    'tapu-lele': 'Tapu Lele',
    'tapu-bulu': 'Tapu Bulu',
    'tapu-fini': 'Tapu Fini',

    // Paradox — Past
    'great-tusk': 'Great Tusk',
    'scream-tail': 'Scream Tail',
    'brute-bonnet': 'Brute Bonnet',
    'flutter-mane': 'Flutter Mane',
    'slither-wing': 'Slither Wing',
    'sandy-shocks': 'Sandy Shocks',
    'roaring-moon': 'Roaring Moon',
    'walking-wake': 'Walking Wake',
    'gouging-fire': 'Gouging Fire',
    'raging-bolt': 'Raging Bolt',

    // Paradox — Future
    'iron-treads': 'Iron Treads',
    'iron-bundle': 'Iron Bundle',
    'iron-hands': 'Iron Hands',
    'iron-jugulis': 'Iron Jugulis',
    'iron-moth': 'Iron Moth',
    'iron-thorns': 'Iron Thorns',
    'iron-valiant': 'Iron Valiant',
    'iron-leaves': 'Iron Leaves',
    'iron-boulder': 'Iron Boulder',
    'iron-crown': 'Iron Crown',
};
const SEARCH_KEY_MAP = {
    '♀': 'f',
    '♂': 'm',
};

const toSearchKey = (str) => {
    return str
        .toLowerCase()
        .replace(/[♀♂]/g, (char) => SEARCH_KEY_MAP[char])
        .replace(/\bfemale\b/g, 'f')
        .replace(/\bmale\b/g, 'm')
        .normalize('NFD')                    // decompose accented chars (é → e + ́)
        .replace(/[\u0300-\u036f]/g, '')     // strip the accent marks
        .replace(/[^a-z0-9]/g, '');          // strip everything that isn't a letter or number
};

const toDisplayName = (speciesName) => {
    if (DISPLAY_NAME_MAP[speciesName]) return DISPLAY_NAME_MAP[speciesName];
    return speciesName
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

// ==============================
// DOM REFERENCES
// ==============================

const loadingScreen = document.querySelector('#loading-screen');
const loadingProgress = document.querySelector('#loading-progress');
const errorScreen = document.querySelector('#error-screen');
const clearEverythingBtn = document.querySelector('#clear-everything-btn');
const searchInput = document.querySelector('#search-input');
const sortBy = document.querySelector('#sort-by');
const sortDirection = document.querySelector('#sort-direction');
const randomBtn = document.querySelector('#random-btn');
const gridViewBtn = document.querySelector('#grid-view-btn');
const listViewBtn = document.querySelector('#list-view-btn');
const viewToggle = document.querySelector('#view-toggle');
const appShell = document.querySelector('#app');
const pokemonGrid = document.querySelector('#pokemon-grid');
const scrollSentinel = document.querySelector('#scroll-sentinel');
const resultCount = document.querySelector('#result-count');
const typeOptionsContainer = document.querySelector('#type-options');
const generationOptionsContainer = document.querySelector('#generation-options');
const typeModeRadios = document.querySelectorAll('input[name="type-mode"]');
const specialCheckboxes = document.querySelectorAll('input[name="special"]');
const applyFiltersBtn = document.querySelector('#apply-filters-btn');
const filterChips = document.querySelector('#filter-chips');
const specialOptions = document.querySelector('#special-options');
const typeMode = document.querySelector('#type-mode');
// Modal references
const modal = document.querySelector('#modal');
const modalArtwork = document.querySelector('#modal-artwork');
const modalName = document.querySelector('#modal-name');
const modalNumber = document.querySelector('#modal-number');
const modalTypes = document.querySelector('#modal-types');
const modalHeight = document.querySelector('#modal-height');
const modalWeight = document.querySelector('#modal-weight');
const modalGeneration = document.querySelector('#modal-generation');
const modalSpecial = document.querySelector('#modal-special');
const modalClose = document.querySelector('#modal-close');
const modalPrevBtn = document.querySelector('#modal-prev');
const modalNextBtn = document.querySelector('#modal-next');
const modalLoading = document.querySelector('#modal-loading');
const modalContent = document.querySelector('#modal-content');
const modalAnnouncer = document.querySelector('#modal-announcer');

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
        typeMode: 'any', // any | single | dual 
        generations: [],    // any selected generations (OR logic)
        special: [],       // legendary | myhtical | baby (OR logic)
    },
    appliedFilters: {       // The confirmed filters the pipeline runs against
        types: [],
        typeMode: 'any', // any | 'single' | 'dual'
        generations: [],
        special: [],
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
        triggerElement: null,
    },
    // --- View ------------------------------
    view: 'grid',
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

const setDraftSpecial = (special) => {
    state.draftFilters.special = special;
};

const applyFilters = () => {
    state.appliedFilters = {
        types: [...state.draftFilters.types],
        typeMode: state.draftFilters.typeMode,
        generations: [...state.draftFilters.generations],
        special: [...state.draftFilters.special],
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
    state.draftFilters = { types: [], typeMode: 'any', generations: [], special: [] };
    state.appliedFilters = { types: [], typeMode: 'any', generations: [], special: [] };
    state.sort = { by: 'id', direction: 'asc' };
    state.visiblePokemon = [];
    state.renderedSubset = [];
    state.modal = { isOpen: false, currentIndex: null, triggerElement: null };
};

// --- Debug ------------------------------
const logState = () => {
    console.log('[State]', JSON.parse(JSON.stringify(state)));
};

const updateViewButtons = () => {
    gridViewBtn.setAttribute('aria-pressed', state.view === 'grid' ? 'true' : 'false');
    listViewBtn.setAttribute('aria-pressed', state.view === 'list' ? 'true' : 'false');
    gridViewBtn.classList.toggle('active', state.view === 'grid');
    listViewBtn.classList.toggle('active', state.view === 'list');
};

// ==============================
//  Pipeline
// ==============================

// Filters allPokemon by activeSearch (greedy substring, case-insensitive)
// Empty search passes everything through
const searchPokemon = (pokemon) => {
    // const term = toSearchKey(state.activeSearch);
    // if (term.length < 2) return pokemon;
    // return pokemon.filter((p) =>
    //     p.searchKey.includes(term) ||
    //     toSearchKey(p.name).includes(term)
    const term = toSearchKey(state.activeSearch);
    if (term.length < 2) return pokemon;

    return pokemon.filter((p) => {
        if (p.searchKey.startsWith(term)) return true;

        const parts = p.speciesName.split('-');
        if (parts.some((part) => part.startsWith(term))) return true;

        const nameParts = p.name.split('-');
        if (nameParts.some((part) => part.startsWith(term))) return true;

        return false;
    });
};

// Filter by appliedFilters
// Each filter group is optional
// Between groups: AND
// Within types: AND
// Within generations/special: OR
const filterPokemon = (pokemon) => {
    const { types, typeMode, generations, special } = state.appliedFilters;

    return pokemon.filter((p) => {

        // Type filter: depends on selected mode
        let passesTypes = true;
        if (types.length > 0) {
            if (typeMode === 'any') {
                passesTypes = types.some((t) => p.types.includes(t));

            } else if (typeMode === 'single') {
                passesTypes = p.types.length === 1 && types.includes(p.types[0]);

            } else if (typeMode === 'dual') {
                passesTypes =
                    types.length > 0 &&
                    p.types.length === 2 &&
                    types.every((t) => p.types.includes(t));
            };
        };

        // Generation filter: pokemon must match ANY selected generation (OR logic)
        const passesGenerations =
            generations.length === 0 ||
            generations.includes(p.generation);

        // Special filter: pokemon must match ANY selected special (OR logic)
        const passesSpecial =
            special.length === 0 ||
            (special.includes('legendary') && p.isLegendary) ||
            (special.includes('mythical') && p.isMythical) ||
            (special.includes('baby') && p.isBaby);

        return passesTypes && passesGenerations && passesSpecial;
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
    resetRender();
};

// ==============================
// LOADING / ERROR UI HELPERS
// ==============================

const updateProgress = (loaded, total) => {
    loadingProgress.textContent = `${loaded} / ${total}`;
};

const hideLoadingScreen = () => {
    loadingScreen.hidden = true;
    appShell.hidden = false;
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
    const speciesData = await fetchData(data.species.url);
    return {
        id: data.id,
        name: data.name,
        speciesName: data.species.name,
        searchKey: toSearchKey(data.species.name),
        displayName: toDisplayName(data.species.name),
        types: data.types.map((t) => t.type.name),
        artwork: data.sprites.other['official-artwork'].front_default,
        sprite: data.sprites.front_default,
        height: data.height,
        weight: data.weight,
        generation: speciesData.generation.name,
        isLegendary: speciesData.is_legendary,
        isMythical: speciesData.is_mythical,
        isBaby: speciesData.is_baby,
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
// RENDERING
// ==============================

// Builds and returns a single .poke-card <article> element for a given pokemon object.
// Why: Keeping creation separate from insertion means renderBatch() can build
// all cards first and append them in one shot
const renderCard = (pokemon) => {
    const card = document.createElement('article');
    card.className = 'poke-card';
    card.setAttribute('role', 'listitem');
    card.setAttribute('tabindex', '0');
    card.dataset.id = pokemon.id;

    // 1 -> #001, 25 -> #025, 150 -> #150
    const paddedId = String(pokemon.id).padStart(3, '0');

    const typeBadgesHTML = pokemon.types
        .map((t) => `<span class='type-badge' data-type='${t}'>${t}</span>`)
        .join('');

    card.innerHTML = `
    <div class='poke-card__top'>
        <h3 class='poke-card__name'>${pokemon.displayName}</h3>
        <span class='poke-card__number'>#${paddedId}</span>
    </div>
    <div class='poke-card__body'>
        <img
            class='poke-card__artwork'
            src='${pokemon.artwork}'
            alt='${pokemon.speciesName} artwork'
            loading='lazy'
        />
        <div class='poke-card__types'>${typeBadgesHTML}</div>
    </div>
    `;

    return card;
};

// ---------- Empty State ----------

// Shows a friendly message inside the grid when no pokemon match
const showEmptyState = () => {
    if (pokemonGrid.querySelector('.empty-state')) return;
    const msg = document.createElement('div');
    msg.className = 'empty-state';
    msg.textContent = 'No Pokemon match your search or filters.';
    pokemonGrid.appendChild(msg);
};

const hideEmptyState = () => {
    const msg = pokemonGrid.querySelector('.empty-state');
    if (msg) msg.remove();
};

// ---------- BATCH RENDERING ----------

// Renders the next BATCH_SIZE cards from visiblePokemon into the grid.
// Uses a DocumentFragment to batch all DOM insertions into a single reflow.
const renderBatch = () => {
    const start = state.renderedSubset.length;
    const end = Math.min(start + BATCH_SIZE, state.visiblePokemon.length);

    if (start >= state.visiblePokemon.length) return;

    const fragment = document.createDocumentFragment();
    const newBatch = state.visiblePokemon.slice(start, end);;

    newBatch.forEach((pokemon) => {
        fragment.appendChild(renderCard(pokemon));
    });

    pokemonGrid.appendChild(fragment);
    appendRenderedSubset(newBatch);
};

// ---------- Reset render ----------

// Called whenever the pipeline runs
const resetRender = () => {

    if (state.view === 'list') {
        pokemonGrid.classList.add('is-list');
    } else {
        pokemonGrid.classList.remove('is-list');
    }
    // Full reset of the grid. Called whenever the pipeline runs
    pokemonGrid.innerHTML = '';
    setRenderedSubset([]);

    const total = state.visiblePokemon.length;
    resultCount.textContent = total === 1 ? '1 Pokemon found' : `${total} Pokemon found`;

    if (total === 0) {
        showEmptyState();
        return;
    }

    hideEmptyState();
    renderBatch();
};

// ---------- Infinite Scroll ----------

// IntersectionObserver watches the #scroll-sentinel div at the bottom of #content.
// When it becomes visible in the viewport, we load the next batch.
const scrollObserver = new IntersectionObserver(
    (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && state.renderedSubset.length < state.visiblePokemon.length) {
            renderBatch();
        }
    },
    {
        rootMargin: '200px',
    }
);

scrollObserver.observe(scrollSentinel);

// ==============================
// Modal Rendering
// ==============================

const renderModal = (pokemon) => {
    const paddedId = String(pokemon.id).padStart(3, '0');

    modalArtwork.src = pokemon.artwork || pokemon.sprite || '';
    modalArtwork.alt = `${pokemon.displayName} artwork`;
    modalName.textContent = pokemon.displayName;
    modalNumber.textContent = `#${paddedId}`;
    modalHeight.textContent = `Height: ${pokemon.height / 10} m`;
    modalWeight.textContent = `Weight: ${pokemon.weight / 10} kg`;

    modalTypes.innerHTML = '';
    pokemon.types.forEach((t) => {
        const badge = document.createElement('span');
        badge.className = 'type-badge';
        badge.dataset.type = t;
        badge.textContent = t;
        modalTypes.appendChild(badge);
    });

    modalGeneration.textContent = '';
    modalSpecial.textContent = '';
};
const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

const trapFocus = (e) => {
    const focusableElements = [...modalContent.querySelectorAll(FOCUSABLE)];
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable.focus();
        }
    } else {
        if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable.focus();
        }
    }
};

const showModal = (pokemon) => {
    renderModal(pokemon);
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    fetchAndRenderSpecies(pokemon);
    modal.addEventListener('keydown', trapFocus);
    announceModal(pokemon);
};

const hideModal = () => {
    modal.hidden = true;
    document.body.style.overflow = '';
    clearAnnouncer();
    modal.removeEventListener('keydown', trapFocus);
    const trigger = state.modal.triggerElement;
    closeModal();
    if (trigger) trigger.focus();
};

const openModalForIndex = (index, triggerEl = null) => {
    state.modal.triggerElement = triggerEl;
    openModal(index);
    const pokemon = state.visiblePokemon[index];
    showModal(pokemon);
    modalClose.focus();
};

const fetchAndRenderSpecies = async (pokemon) => {
    modalGeneration.textContent = '';
    modalSpecial.textContent = '';
    modalLoading.textContent = 'Loading details...';
    modalLoading.hidden = false;

    try {
        const generation = pokemon.generation
            .replace('generation-', 'Gen ')
            .toUpperCase();

        const specials = [];
        if (pokemon.isLegendary) specials.push('Legendary');
        if (pokemon.isMythical) specials.push('Mythical');
        if (pokemon.isBaby) specials.push('Baby');

        modalGeneration.textContent = `Generation: ${generation}`;
        modalSpecial.textContent = specials.length > 0 ? specials.join(' · ') : '';
    } catch (error) {
        modalGeneration.textContent = '';
        modalSpecial.textContent = '';
        console.error('[Modal] Failed to render species data:', error);
    } finally {
        modalLoading.hidden = true;
    };
};

const announceModal = (pokemon) => {
    modalAnnouncer.textContent = `${pokemon.displayName} details open`;
};

const clearAnnouncer = () => {
    modalAnnouncer.textContent = '';
};

// ==============================
// SIDEBAR RENDERING
// ==============================

const TYPES = [
    'normal', 'fire', 'water', 'electric', 'grass', 'ice',
    'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
    'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
];

const GENERATIONS = [
    { label: 'Gen 1', value: 'generation-i' },
    { label: 'Gen 2', value: 'generation-ii' },
    { label: 'Gen 3', value: 'generation-iii' },
    { label: 'Gen 4', value: 'generation-iv' },
    { label: 'Gen 5', value: 'generation-v' },
    { label: 'Gen 6', value: 'generation-vi' },
    { label: 'Gen 7', value: 'generation-vii' },
    { label: 'Gen 8', value: 'generation-viii' },
    { label: 'Gen 9', value: 'generation-ix' },
];

// Builds a type button for each of the 18 types.
// Clicking a type toggles it in draftFilters.types (max 2)
const renderTypeButtons = () => {
    typeOptionsContainer.innerHTML = '';

    TYPES.forEach((type) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = type;
        btn.dataset.type = type;
        btn.setAttribute('aria-pressed', 'false');

        // If this type is already in the draft (e.g. after a clear), reflect it
        if (state.draftFilters.types.includes(type)) {
            btn.setAttribute('aria-pressed', 'true');
            btn.classList.add('active');
        }

        btn.addEventListener('click', () => {
            const current = [...state.draftFilters.types];

            const index = current.indexOf(type);

            if (index !== -1) {
                current.splice(index, 1);
            } else {
                if (state.draftFilters.typeMode === 'dual' && current.length === 2) return;
                current.push(type);
            }

            setDraftTypes(current);
            updateTypeButtons();
            updateApplyButton();
        });
        typeOptionsContainer.appendChild(btn);
    });
};

// Syncs the visual active state of all the type buttons to draftFilters.types
const updateTypeButtons = () => {
    typeOptionsContainer.querySelectorAll('button').forEach((btn) => {
        const isActive = state.draftFilters.types.includes(btn.dataset.type);
        btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        btn.classList.toggle('active', isActive);
    });

    const isDualCapped = state.draftFilters.typeMode === 'dual' && state.draftFilters.types.length >= 2;
    typeOptionsContainer.classList.toggle('is-capped', isDualCapped);
};

const renderGenerationOptions = () => {
    generationOptionsContainer.innerHTML = '';

    GENERATIONS.forEach((gen) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = gen.label;
        btn.dataset.generation = gen.value;
        btn.setAttribute('aria-pressed', 'false');

        // If this type is already in the draft (e.g. after a clear), reflect it
        if (state.draftFilters.generations.includes(gen.value)) {
            btn.setAttribute('aria-pressed', 'true');
            btn.classList.add('active');
        }

        btn.addEventListener('click', () => {
            const current = [...state.draftFilters.generations];

            const index = current.indexOf(gen.value);

            if (index !== -1) {
                current.splice(index, 1);
            } else {
                current.push(gen.value);
            }
            setDraftGenerations(current);
            updateGenerationsButtons();
            updateApplyButton();
        });
        generationOptionsContainer.appendChild(btn);
    });
};

const updateGenerationsButtons = () => {
    generationOptionsContainer.querySelectorAll('button').forEach((btn) => {
        const isActive = state.draftFilters.generations.includes(btn.dataset.generation);
        btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        btn.classList.toggle('active', isActive);
    });
};

const syncSpecialCheckboxes = () => {
    specialCheckboxes.forEach((cb) => {
        cb.checked = state.draftFilters.special.includes(cb.value);
    });
};

const syncTypeModeRadios = () => {
    typeModeRadios.forEach((radio) => {
        radio.checked = radio.value === state.draftFilters.typeMode;
    });
};

const isDraftSameAsApplied = () => {
    const d = state.draftFilters;
    const a = state.appliedFilters;

    const sameTypes = [...d.types].sort().join() === [...a.types].sort().join();
    const sameTypeMode = d.typeMode === a.typeMode;
    const sameGenerations = [...d.generations].sort().join() === [...a.generations].sort().join();
    const sameSpecial = [...d.special].sort().join() === [...a.special].sort().join();

    return sameTypes && sameTypeMode && sameGenerations && sameSpecial;
};

const updateApplyButton = () => {
    applyFiltersBtn.disabled = isDraftSameAsApplied();
};

const renderFilterChips = () => {
    filterChips.innerHTML = '';

    const { types, typeMode, generations, special } = state.appliedFilters;

    const chipsToRender = [];

    types.forEach((t) => chipsToRender.push({ label: t, group: 'type', value: t }));

    generations.forEach((g) => {
        const match = GENERATIONS.find((gen) => gen.value === g);
        chipsToRender.push({ label: match ? match.label : g, group: 'generation', value: g });
    });

    special.forEach((s) => chipsToRender.push({ label: s, group: 'special', value: s }));

    chipsToRender.forEach(({ label, group, value }) => {
        const chip = document.createElement('div');
        chip.className = 'chip';

        const chipLabel = document.createElement('span');
        chipLabel.textContent = label;

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.textContent = 'x';
        removeBtn.setAttribute('aria-label', `Remove ${label} filter`);

        removeBtn.addEventListener('click', () => {
            if (group === 'type') {
                const updated = state.appliedFilters.types.filter((t) => t !== value);
                state.appliedFilters.types = updated;
                state.draftFilters.types = [...updated];

                if (updated.length === 0) {
                    state.appliedFilters.typeMode = 'any';
                    state.draftFilters.typeMode = 'any';
                }
            }

            if (group === 'generation') {
                const updated = state.appliedFilters.generations.filter((g) => g !== value);
                state.appliedFilters.generations = updated;
                state.draftFilters.generations = [...updated];
            }

            if (group === 'special') {
                const updated = state.appliedFilters.special.filter((s) => s !== value);
                state.appliedFilters.special = updated;
                state.draftFilters.special = [...updated];
            }

            runPipeline();
            renderFilterChips();
            syncSidebarToState();
        });
        chip.appendChild(chipLabel);
        chip.appendChild(removeBtn);
        filterChips.appendChild(chip);
    });
};

const syncSidebarToState = () => {
    updateTypeButtons();
    updateGenerationsButtons();
    syncSpecialCheckboxes();
    syncTypeModeRadios();
    updateApplyButton();
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


// ==============================
// Event Listeners
// ==============================

clearEverythingBtn.addEventListener('click', () => {
    resetAll();

    // Sync topbar UI back to default state
    searchInput.value = '';
    sortBy.value = 'id';
    const sortBtn = sortDirection;
    sortBtn.textContent = '↑';
    sortBtn.setAttribute('aria-label', 'Sort direction: ascending');

    runPipeline();
    renderFilterChips();
    syncSidebarToState();
});

searchInput.addEventListener('input', (e) => {
    setSearchDraft(e.target.value);
});

searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        applySearch();
        runPipeline();
    }
});

sortBy.addEventListener('change', (e) => {
    setSort(e.target.value, state.sort.direction);
    runPipeline();
});

sortDirection.addEventListener('click', () => {
    const newDirection = state.sort.direction === 'asc' ? 'desc' : 'asc';
    setSort(state.sort.by, newDirection);
    console.log(state.sort)

    const btn = sortDirection;
    btn.textContent = newDirection === 'asc' ? '↑' : '↓';
    btn.setAttribute('aria-label', `Sort direction: ${newDirection === 'asc' ? 'ascending' : 'descending'}`);

    runPipeline();
});

randomBtn.addEventListener('click', () => {
    if (!state.visiblePokemon.length) return;

    const randomIndex = Math.floor(Math.random() * state.visiblePokemon.length);

    openModalForIndex(randomIndex);
});

gridViewBtn.addEventListener('click', () => {
    if (state.view !== 'grid') {
        state.view = 'grid';
        runPipeline();
        updateViewButtons();
    }

});
listViewBtn.addEventListener('click', () => {
    if (state.view !== 'list') {
        state.view = 'list';
        runPipeline();
        updateViewButtons();
    }
});

specialOptions.addEventListener('change', () => {
    const checked = [...specialCheckboxes]
        .filter((cb) => cb.checked)
        .map((cb) => cb.value);

    setDraftSpecial(checked);
    updateApplyButton();
});

typeMode.addEventListener('change', (e) => {
    const newMode = e.target.value;
    setDraftTypeMode(newMode);

    if (newMode === 'dual' && state.draftFilters.types.length > 2) {
        setDraftTypes(state.draftFilters.types.slice(0, 2));
    }
    updateTypeButtons();
    updateApplyButton();
});

applyFiltersBtn.addEventListener('click', () => {
    applyFilters();
    runPipeline();
    renderFilterChips();
    updateApplyButton();
})

modalClose.addEventListener('click', () => hideModal());

modalPrevBtn.addEventListener('click', () => {
    modalPrev();
    const pokemon = state.visiblePokemon[state.modal.currentIndex];
    showModal(pokemon);
});

modalNextBtn.addEventListener('click', () => {
    modalNext();
    const pokemon = state.visiblePokemon[state.modal.currentIndex];
    showModal(pokemon);
});

document.addEventListener('keydown', (e) => {
    if (!state.modal.isOpen) return;

    if (e.key === 'Escape') {
        hideModal();
    }

    if (e.key === 'ArrowLeft') {
        modalPrev();
        const pokemon = state.visiblePokemon[state.modal.currentIndex];
        showModal(pokemon)
    }

    if (e.key === 'ArrowRight') {
        modalNext();
        const pokemon = state.visiblePokemon[state.modal.currentIndex];
        showModal(pokemon);
    }
});

pokemonGrid.addEventListener('click', (e) => {
    const card = e.target.closest('.poke-card');
    if (!card) return;

    const id = Number(card.dataset.id);
    const index = state.visiblePokemon.findIndex((p) => p.id === id);
    if (index === -1) return;

    openModalForIndex(index, card);
})


renderTypeButtons();
renderGenerationOptions();
updateApplyButton();
loadAllPokemon();