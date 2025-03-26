import { pokedexContainer } from '../../utils/domUtils.js';

const typeCheckboxes = document.querySelector('#type-checkboxes');
const secondTypeCheckboxes = document.querySelector('#second-type-checkboxes');
const filterRadios = document.querySelectorAll('input[name="filterMode"]');

export const selectedTypes = new Set();
const selectedSecondTypesSet = new Set();

// Filter Pokémon by selected types (single or dual)
const filterByAnyType = (pokemon, selectedFirstTypes) => {
    return selectedFirstTypes.some(type =>
        pokemon.types.some(t => t.type.name === type));
};

// Filter Pokémon with dual types
const filterByDoubleType = (pokemon, selectedFirstTypes, selectedSecondTypes) => {
    return pokemon.types.length === 2 &&
        selectedFirstTypes.some(type => pokemon.types.some(t => t.type.name === type)) &&
        selectedSecondTypes.some(type => pokemon.types.some(t => t.type.name === type));
};

// Filter Pokémon with a single type
const filterBySingleType = (pokemon, selectedFirstTypes) => {
    return pokemon.types.length === 1 &&
        selectedFirstTypes.includes(pokemon.types[0].type.name);
};

const selectSecondTypeMessage = () => {
    const selectSecondTypeMessage = document.createElement('p');
    selectSecondTypeMessage.textContent = 'Please, select a second type.';
    pokedexContainer.appendChild(selectSecondTypeMessage);
};

// handleTypesFilter
export const handleTypesFilter = (pokemonList) => {
    const filterMode = document.querySelector('input[name="filterMode"]:checked')?.value;
    const selectedFirstTypes = Array.from(selectedTypes);
    const selectedSecondTypes = Array.from(selectedSecondTypesSet);

    if (selectedFirstTypes.length === 0) return pokemonList;

    if (filterMode === 'double' && !selectedSecondTypes.length) {
        selectSecondTypeMessage();
        return [];
    };

    const filterFunctions = {
        any: (pokemon) => filterByAnyType(pokemon, selectedFirstTypes),
        double: (pokemon) => filterByDoubleType(pokemon, selectedFirstTypes, selectedSecondTypes),
        single: (pokemon) => filterBySingleType(pokemon, selectedFirstTypes)
    };

    const filterFunction = filterFunctions[filterMode];

    if (!filterFunction) {
        console.error(`Unknown filter mode: ${filterMode}`);
        return pokemonList;
    };

    const filteredPokemon = pokemonList.filter(filterFunction);
    return filteredPokemon;
};

export const typesFiltersListeners = () => {
    typeCheckboxes.addEventListener('change', (e) => {
        if (e.target.classList.contains('type-filter')) {
            const type = e.target.value;
            if (e.target.checked) {
                selectedTypes.add(type);
                console.log(selectedTypes);
            } else {
                selectedTypes.delete(type);
                console.log(selectedTypes);
            };
        };
    });

    secondTypeCheckboxes.addEventListener('change', (e) => {
        if (e.target.classList.contains('second-type-filter')) {
            const checkbox = e.target;
            if (checkbox.checked) {
                selectedSecondTypesSet.add(checkbox.value);
                console.log('Second Type: ', selectedSecondTypesSet);
            } else {
                selectedSecondTypesSet.delete(checkbox.value);
                console.log(selectedSecondTypesSet);
            };
        };
    });

    filterRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            const selectedValue = document.querySelector('input[name="filterMode"]:checked').value;

            if (selectedValue === 'double') {
                secondTypeCheckboxes.style.display = 'block';
            } else {
                secondTypeCheckboxes.style.display = 'none';
            };
        });
    });
};