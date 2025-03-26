export const pokedexContainer = document.querySelector('#pokedex-container');
export const suggestionsContainer = document.querySelector('#suggestions-container');

export const clearContainer = () => {
    pokedexContainer.innerHTML = '';
};

export const clearSuggestionsContainer = () => {
    suggestionsContainer.innerHTML = '';
};

export const displayNoResultsMessage = () => {
    const noResultsMessage = document.createElement('p');
    noResultsMessage.textContent = 'No Pokémon found.';
    pokedexContainer.appendChild(noResultsMessage);
};
