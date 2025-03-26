import { clearContainer, displayNoResultsMessage } from "../utils/domUtils.js";
import { renderPokemonCards } from "./pokedexCardGenerator.js";
import { allPokemon } from "../services/pokemonLoader.js";
import { handleTypesFilter, typesFiltersListeners } from "./filters/typeFilters.js"
import { handleAbilityFilter } from "./filters/abilityFilter.js"
import { handleGenerationsFilter, populateGenerationsDropdown } from "./filters/generationFilter.js";
import { handleRarityFilters, rarityFiltersListeners } from "./filters/rarityFilter.js";
import { handleColorFilter } from "./filters/colorFilter.js";
import { handleEggGroupFilter } from "./filters/eggGroupFilter.js";
import { handleShapeFilter } from "./filters/shapeFilter.js";

const applyFilters = document.querySelector('#apply-filters');

export const populateUIComponents = () => {
    populateGenerationsDropdown();
};

const filterFunctions = [
    handleTypesFilter,
    handleAbilityFilter,
    handleGenerationsFilter,
    handleRarityFilters,
    handleColorFilter,
    handleEggGroupFilter,
    handleShapeFilter
];

// applyAllFilters
const applyAllFilters = async () => {
    clearContainer();

    let filteredPokemon = Array.from(allPokemon.values());

    for (const filter of filterFunctions) {
        filteredPokemon = await filter(filteredPokemon);
    };

    if (filteredPokemon.length > 0) {
        await renderPokemonCards(filteredPokemon);
    } else {
        displayNoResultsMessage();
    };
};

// event listeners
export const handleApplyFiltersListeners = () => {
    typesFiltersListeners();
    rarityFiltersListeners();
    applyFilters.addEventListener('click', applyAllFilters);
};

