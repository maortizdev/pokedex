const legendaryFilter = document.querySelector('#legendary-filter');
const mythicalFilter = document.querySelector('#mythical-filter');

let isLegendaryChecked = false;
let isMythicalChecked = false;

export const handleRarityFilters = (pokemonList) => {
    if (!isLegendaryChecked && !isMythicalChecked) return pokemonList;

    return pokemonList.filter(pokemon => {
        if (isLegendaryChecked && pokemon.isLegendary) return true;
        if (isMythicalChecked && pokemon.isMythical) return true;
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
};
