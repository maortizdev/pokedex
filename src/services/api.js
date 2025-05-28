// Base URL for PokeAPI
const POKE_API_BASE = 'https://pokeapi.co/api/v2';

/**
 * API endpoints for fetching specific data from the PokéAPI.
 * Each function dynamically generates the URL for the given resource.
 */
const ENDPOINTS = {
    pokemon: (pokemonIdentifier) => `${POKE_API_BASE}/pokemon/${pokemonIdentifier}`,
    species: (id) => `${POKE_API_BASE}/pokemon-species/${id}`,
    pokedexes: (id) => `${POKE_API_BASE}/pokedex/${id}`,
    types: (name) => `${POKE_API_BASE}/type/${name}`,
    allTypes: () => `${POKE_API_BASE}/type?limit=20`,
    abilities: (name) => `${POKE_API_BASE}/ability/${name}`,
    allAbilities: () => `${POKE_API_BASE}/ability?limit=400`,
    stats: (name) => `${POKE_API_BASE}/stat/${name}`,
    allStats: () => `${POKE_API_BASE}/stat?limit=10`,
    shapes: (name) => `${POKE_API_BASE}/pokemon-shape/${name}`,
    allShapes: () => `${POKE_API_BASE}/pokemon-shape?limit=20`,
    allColors: () => `${POKE_API_BASE}/pokemon-color?limit=20`,
    allEggGroups: () => `${POKE_API_BASE}/egg-group?limit=20`,
};

/**
 * Fetches data from a given URL and returns the parsed JSON.
 * 
 * @param {string} url - The URL from which to fetch data.
 * @returns {Promise<Object>} - A promise that resolves to the parsed JSON data from the response.
 * @throws {Error} - Throws an error if the request fails or the response is not ok.
 */
const fetchData = async (url) => {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch data from ${url}`);
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
};

// Fetch functions for specific data types

/**
 * Fetch a single Pokémon's data by its ID or Name
 * 
 * @param {(number|string)} pokemonIdentifier - The ID or Name of the Pokémon.
 * @returns {Promise<Object>} - The Pokémon's data.
 */
export const fetchPokemon = (pokemonIdentifier) => {
    return fetchData(ENDPOINTS.pokemon(pokemonIdentifier));
};

/**
 * Fetch a single Pokémon Species' data by its ID or Name
 * 
 * @param {(number|string)} pokemonIdentifier - The ID or Name of the Pokémon Species.
 * @returns {Promise<Object>} - The Pokémon's data.
 */
export const fetchSpecies = (id) => {
    return fetchData(ENDPOINTS.species(id));
};

/**
 * Fetch data for a single Pokédex by ID
 * 
 * @param {number} id - The ID of the Pokédex
 * @returns {Promise<Array>} - An array of Pokémon entries with their regional numbers and species.
 */
export const fetchPokedex = async (id) => {
    try {
        const data = await fetchData(ENDPOINTS.pokedexes(id));
        return data.pokemon_entries.map(entry => ({
            regionalNumber: entry.entry_number,
            species: entry.pokemon_species
        }));
    } catch {
        console.error.apply(`Error fetching Pokédex with ID: ${id}:`, error);
        return [];
    };
};

/**
 * Fetch data for a sungle Pokémon type by name.
 * 
 * @param {string} name - The Name of the Type
 * @returns {Promise<Object>} - The Type's data.
 */
export const fetchTypes = (name) => {
    return fetchData(ENDPOINTS.types(name));
};

/**
 * Fetch data for a single Ability by name.
 * 
 * @param {string} name - The Name of the Ability
 * @returns {Promise<Object>} - The Ability's data.
 */
export const fetchAbilities = (name) => {
    return fetchData(ENDPOINTS.abilities(name));
};

/**
 * Fetches data for all Pokémon abilities.
 * 
 * @returns {Promise<Object>} - Data of all abilities.
 */
export const fetchAllAbilities = () => {
    return fetchData(ENDPOINTS.allAbilities());
};

/**
 * Fetch a single Stat's data by its Name
 * 
 * @param {string} name - The Name of the Stat
 * @returns {Promise<Object>} - The Stat's data.
 */
export const fetchStats = (name) => {
    return fetchData(ENDPOINTS.stats(name));
};

/**
 * Fetch data of all Stats
 * 
 * @returns {Promise<Object>} - All Abilities' data.
 */
export const fetchAllStats = () => {
    return fetchData(ENDPOINTS.allStats());
};

/**
 * Fetch a single Shape's data by its Name
 * 
 * @param {string} name - The Name of the Shape
 * @returns {Promise<Object>} - The Shape's data.
 */
export const fetchShapes = (name) => {
    return fetchData(ENDPOINTS.shapes(name));
};

/**
 * Fetches data for all Pokémon colors.
 * 
 * @returns {Promise<Object>} - Data of all Pokémon colors.
 */
export const fetchAllColors = () => {
    return fetchData(ENDPOINTS.allColors());
};


/**
 * Fetches data for all Pokémon egg groups.
 * 
 * @returns {Promise<Object>} - Data of all Pokémon egg groups.
 */
export const fetchAllEggGroups = () => {
    return fetchData(ENDPOINTS.allEggGroups());
};

/**
 * Fetches data for all Pokémon shapes.
 * 
 * @returns {Promise<Object>} - Data of all Pokémon shapes.
 */
export const fetchAllShapes = () => {
    return fetchData(ENDPOINTS.allShapes());
};



