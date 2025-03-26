import { renderPokemonCards } from "./pokedexCardGenerator.js";
import { clearContainer, clearSuggestionsContainer, displayNoResultsMessage } from "../utils/domUtils.js";
import { allPokemon, allPokemonNames } from "../services/pokemonLoader.js";
import { suggestionsContainer } from "../utils/domUtils.js";
import { getDisplayName, getApiName, debounce } from "../utils/helpers.js";

const DEBOUNCE_TIME = 300;
const searchInput = document.querySelector('#search-input');
const searchButton = document.querySelector('#search-button');
const clearButton = document.querySelector('#clear-button');

const handleValidQuery = (query) => {
    const apiQuery = getApiName(query);
    console.log(`API Query: ${apiQuery}`);

    const pokemon = allPokemon.get(apiQuery);
    console.log(`${pokemon.name} / ${pokemon.species.name}`);

    if (pokemon) {
        console.log(`Pokemon Found: ${pokemon.species.name}`)
        renderPokemonCards([pokemon]);
    } else {
        console.log('Pokemon not found.');
        displayNoResultsMessage();
    }
};

const searchAndFilterPokemon = (query) => {
    clearContainer();

    console.log('-'.repeat(40));
    console.log('Search and Filter Pokemon Beginning!');

    if (query === '') {
        renderPokemonCards(Array.from(allPokemon.values()));
    } else {
        handleValidQuery(query);
    }
    console.log('Search and Filter Pokemon End!');
    console.log('-'.repeat(40));
};

/****************************************************
 *                  SUGGESTIONS
 ****************************************************/

const getFilteredSuggestions = (query, maxResults = 5) => {
    const normalizedQuery = query.toLowerCase();
    return allPokemonNames
        .filter(pokemonName => pokemonName.toLowerCase().startsWith(normalizedQuery))
        .slice(0, maxResults)
};

const highlightMatch = (name, query) => {
    const regex = new RegExp(query, 'gi');
    return name.replace(regex, match => `<strong>${match}</strong>`);
};

const createSuggestionElement = (displayName, highlightedName, apiName) => {
    const suggestionElement = document.createElement('div');
    suggestionElement.innerHTML = highlightedName;
    suggestionElement.classList.add('suggestion-item');

    suggestionElement.addEventListener('click', () => {
        searchInput.value = displayName;
        clearSuggestionsContainer();
        searchAndFilterPokemon(apiName);
    });

    return suggestionElement;
};

const renderSuggestions = (query) => {
    clearSuggestionsContainer();

    const suggestions = getFilteredSuggestions(query);

    suggestions.forEach(suggestion => {
        const correctedName = getDisplayName(suggestion);
        const highlightedName = highlightMatch(correctedName, query);
        const apiName = getApiName(suggestion.toLowerCase().replace(/ /g, '-'));
        console.log(`${correctedName} / ${highlightedName} / ${apiName}`);
        const suggestionElement = createSuggestionElement(correctedName, highlightedName, apiName);
        suggestionsContainer.appendChild(suggestionElement);
    });
};

const showSuggestions = (query) => {
    if (query.length > 1) {
        renderSuggestions(query);
    } else {
        clearSuggestionsContainer();
    }
};

const debounceShowSuggestions = debounce(showSuggestions, DEBOUNCE_TIME);

const searchButtonHandler = () => {
    const query = searchInput.value.trim();
    const apiQuery = getApiName(query);
    console.log(`Search Query: ${query} (API Query: ${apiQuery})`);
    searchAndFilterPokemon(query);
};

/****************************************************
 *                 EVENT LISTENERS
 ****************************************************/

export const setUpSearchListener = () => {
    searchButton.addEventListener('click', searchButtonHandler);

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchButtonHandler();
        }
    });

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        debounceShowSuggestions(query);
    });

    clearButton.addEventListener('click', () => {
        searchInput.value = '';
        clearSuggestionsContainer();
        searchAndFilterPokemon('');
    });
};