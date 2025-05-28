const legendaryFilter = document.querySelector('#legendary-filter');
const mythicalFilter = document.querySelector('#mythical-filter');
const babyFilter = document.querySelector('#baby-filter');
const normalFilter = document.querySelector('#normal-filter');

let isLegendaryChecked = false;
let isMythicalChecked = false;
let isBabyChecked = false;
let isNormalChecked = false;

export const handleRarityFilters = (pokemonList) => {
    if (!isLegendaryChecked && !isMythicalChecked && !isBabyChecked && !isNormalChecked) return pokemonList;

    return pokemonList.filter(pokemon => {
        if (isLegendaryChecked && pokemon.isLegendary) return true;
        if (isMythicalChecked && pokemon.isMythical) return true;
        if (isBabyChecked && pokemon.isBaby) return true;
        if (isNormalChecked && !pokemon.isLegendary && !pokemon.isMythical && !pokemon.isBaby) return true;
        return false;
    });
};


export const rarityFiltersListeners = () => {
    legendaryFilter.addEventListener('change', (e) => {
        isLegendaryChecked = e.target.checked;
    });

    mythicalFilter.addEventListener('change', (e) => {
        isMythicalChecked = e.target.checked;
    });

    babyFilter.addEventListener('change', (e) => {
        isBabyChecked = e.target.checked;
    });

    normalFilter.addEventListener('change', (e) => {
        isNormalChecked = e.target.checked;
    });
};
