import { fetchPokemon, fetchSpecies } from "./api.js";
import { renderPokemonCards } from "../components/pokedexCardGenerator.js";
import { selectedTypes } from "../components/filters/typeFilters.js";
import { generationMap } from "../components/filters/generationFilter.js";

export const allPokemon = new Map();
export const allPokemonNames = [];
export let selectedGeneration = null;

/**
 * Fetches and processes Pokémon data, then renders filtered results.
 *
 * Function Details:
 * - Generates an array of Pokémon IDs from 1 to 1025.
 * - Concurrently fetches Pokémon data using `Promise.allSettled` for robust error handling.
 * - Filters successful fetch results and populates global data structures (`allPokemon` and `allPokemonNames`).
 * - Applies type filtering logic to generate a list of Pokémon matching the selected types.
 * - Renders the filtered Pokémon list using `renderPokemonCards`.
 * - Logs any fetch failures for debugging purposes.
 *
 * @async
 * @function loadPokemon
 * @returns {Promise<void>} Resolves when all processing and rendering are complete.
 */
export const loadPokemon = async () => {
    const maxPokemon = 1025;
    const batchSize = 50;

    try {
        // Generate an array of Pokémon IDs (1 to maxPokemon)
        const pokemonIds = Array.from({ length: maxPokemon }, (_, index) => index + 1);
        const pokemonList = [];

        const fetchBatch = async (ids) => {
            // Fetch Pokémon data concurrently with Promise.allSettled for better error handling
            const pokemonPromises = ids.map(id => fetchPokemon(id));
            const speciesPromises = ids.map(id => fetchSpecies(id));

            // Fetch data concurrently within the batch
            const [pokemonResults, speciesResults] = await Promise.all([
                Promise.allSettled(pokemonPromises),
                Promise.allSettled(speciesPromises),
            ]);

            return { pokemonResults, speciesResults };
        };

        for (let i = 0; i < pokemonIds.length; i += batchSize) {
            const batchIds = pokemonIds.slice(i, i + batchSize);
            // Fetch a batch of Pokémon and species data
            const { pokemonResults, speciesResults } = await fetchBatch(batchIds);

            pokemonResults.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    const pokemon = result.value;
                    const species = speciesResults[index]?.status === 'fulfilled'
                        ? speciesResults[index].value
                        : null;

                    // Combine Pokémon and species data here
                    const generation = species ? generationMap[species.generation.name] : null;
                    const isLegendary = species?.is_legendary || false;
                    const isMythical = species?.is_mythical || false;
                    const color = species.color.name;
                    const eggGroup = species.egg_groups.map(egg => egg.name);
                    const shape = species.shape.name;

                    const combinedData = { ...pokemon, generation, isLegendary, isMythical, color, eggGroup, shape };

                    allPokemon.set(combinedData.name, combinedData);
                    allPokemonNames.push(combinedData.name);

                    const dataTypes = combinedData.types.every(t => selectedTypes.has(t.type.name));
                    const matchesGeneration = selectedGeneration === null || combinedData.generation === selectedGeneration;

                    if ((selectedTypes.size === 0 || dataTypes) && matchesGeneration) {
                        pokemonList.push(combinedData);
                    };
                } else {
                    console.error(`Failed to fetch Pokémon ID ${batchIds[index]}: ${result.reason}`);
                };
            });
        };

        // Render the successful Pokémon data by passing it to appendPokemonCard function
        await renderPokemonCards(pokemonList);
    } catch (error) {
        // Handle any unexpected errors during the Pokémon loading process
        console.error(`An error occurred while loading Pokémon: ${error.message}`);
    };
};