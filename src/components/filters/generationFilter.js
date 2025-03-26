export const generationMap = {
    "generation-i": "1",
    "generation-ii": "2",
    "generation-iii": "3",
    "generation-iv": "4",
    "generation-v": "5",
    "generation-vi": "6",
    "generation-vii": "7",
    "generation-viii": "8",
    "generation-ix": "9"
};

const generationsDropdown = document.querySelector('#generations-dropdown');

export const populateGenerationsDropdown = () => {
    const generations = Object.entries(generationMap);

    generations.forEach(([apiName, displayName]) => {
        const option = document.createElement('option');
        option.value = apiName;
        option.textContent = `Generation ${displayName}`;
        generationsDropdown.appendChild(option);
    });
};

export const handleGenerationsFilter = (pokemonList) => {
    const selectedGeneration = generationsDropdown.value;

    console.log(selectedGeneration);
    if (!selectedGeneration) return pokemonList;

    const filteredPokemonList = pokemonList.filter(pokemon =>
        pokemon.generation === generationMap[selectedGeneration]
    );

    console.log(filteredPokemonList);
    return filteredPokemonList;
};