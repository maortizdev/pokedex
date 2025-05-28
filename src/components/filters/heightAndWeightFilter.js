import { allPokemon } from "../../services/pokemonLoader.js";

export const handleHeightAndWeightFilter = async (pokemonList) => {
    const minHeight = parseFloat(document.querySelector('#min-height').value) || 0;
    const maxHeight = parseFloat(document.querySelector('#max-height').value) || Infinity;
    const minWeight = parseFloat(document.querySelector('#min-weight').value) || 0;
    const maxWeight = parseFloat(document.querySelector('#max-weight').value) || Infinity;

    return pokemonList.filter(pokemon => {
        const heightInMeters = pokemon.height / 10;
        const weightInKg = pokemon.weight / 10;

        return (
            heightInMeters >= minHeight &&
            heightInMeters <= maxHeight &&
            weightInKg >= minWeight &&
            weightInKg <= maxWeight
        );
    });
};

export const heightAndWeightFilterListeners = () => {
    document.querySelector('#min-height').addEventListener('input', () => { });
    document.querySelector('#max-height').addEventListener('input', () => { });
    document.querySelector('#min-weight').addEventListener('input', () => { });
    document.querySelector('#max-weight').addEventListener('input', () => { });
};
