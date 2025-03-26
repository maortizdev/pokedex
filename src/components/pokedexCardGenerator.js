import { capitalizeName, getDisplayName } from "../utils/helpers.js";

const pokedexContainer = document.querySelector('#pokedex-container');

/**
 * Creates a Pokémon card element.
 * 
 * @param {Object} data - The Pokémon data to display.
 * @param {string} data.name - The name of the Pokémon.
 * @returns {HTMLElement} - The generated Pokémon card element.
 */
const createPokemonCards = (data) => {
    const pokemonCard = document.createElement('div');
    pokemonCard.classList.add('pokemon-card');

    const cardId = document.createElement('p');
    cardId.classList.add('pokemon-card-id');
    cardId.innerText = data.id;

    const cardName = document.createElement('h2');
    const correctedName = getDisplayName(data.species.name);
    cardName.innerText = correctedName;

    const cardTypes = document.createElement('div');
    cardTypes.classList.add('pokemon-card-types');

    data.types.forEach(t => {
        const typeElement = document.createElement('p');
        typeElement.classList.add('type', t.type.name);
        typeElement.innerText = capitalizeName(t.type.name);
        cardTypes.appendChild(typeElement);
    })

    pokemonCard.append(cardId, cardName, cardTypes);

    return pokemonCard;
}

/**
 * Renders a list of Pokémon cards in the Pokedex container.
 * 
 * @param {Array} pokemonList - The array of Pokémon data objects to render.
 * @return {void}
 */
export const renderPokemonCards = (pokemonList) => {
    const fragment = document.createDocumentFragment();
    for (const pokemon of pokemonList) {
        const card = createPokemonCards(pokemon);
        fragment.appendChild(card)
    }
    pokedexContainer.appendChild(fragment);
}
