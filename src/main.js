const searchBtn = document.getElementById('search-btn');
const searchInput = document.getElementById('search-input');
const pokemonDisplay = document.getElementById('pokemon-display');
const errorMessage = document.getElementById('error-message');

function fetchPokemon() {
    // 1. Get the user's input (Pokemon name)
    const pokemonName = searchInput.value.toLowerCase().trim();

    // 2. Clear previous messages
    errorMessage.textContent = '';
    pokemonDisplay.textContent = '';

    // 3. Validate input
    if (!pokemonName) {
        errorMessage.textContent = 'Please enter a Pokemon name.';
        return;
    }

    // 4. Make the API call to PokeAPI
    const apiUrl = `https://pokeapi.co/api/v2/pokemon/${pokemonName}`;

    fetch(apiUrl)
        .then(response => {
            // Check if the response is successful
            if (!response.ok) {
                throw new Error('Pokemon not found');
            }
            return response.json(); // Convert to JSON
        })
        .then(data => {
            //Success! Store the data for Issue #4 to display
            console.log(data);
            // TODO: Pass data to display function (Issue #4)
        })
        .catch(error => {
            // Handle errors
            errorMessage.textContent = `Error: ${error.message}. Please try again.`;
        });
}

searchBtn.addEventListener('click', fetchPokemon);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        fetchPokemon();
    }
});

