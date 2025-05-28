// A mapping of Pokémon names that require specific capitalization or punctuation corrections.
export const NAME_CORRECTIONS = {
    "Ho-Oh": "ho-oh",
    "Farfetch'd": "farfetchd",
    "Sirfetch'd": "sirfetchd",
    "Type: Null": "type-null",
    "Mr. Mime": "mr-mime",
    "Mr. Rime": "mr-rime",
    "Mime Jr.": "mime-jr",
    "Porygon-Z": "porygon-z",
    "Jangmo-o": "jangmo-o",
    "Hakamo-o": "hakamo-o",
    "Kommo-o": "kommo-o",
    "Nidoran♀": "nidoran-f",
    "Nidoran♂": "nidoran-m",
    "Flabébé": "flabebe",
    "Wo-Chien": "wo-chien",
    "Chien-Pao": "chien-pao",
    "Ting-Lu": "ting-lu",
    "Chi-Yu": "chi-yu"
}

/**
 * Capitalizes each part of a Pokémon's name.
 * Splits the name by hyphens, handles special characters, and capitalizes each part.
 * 
 * @param {string} name - The Pokémon name in lowercase, hyphen-separated format.
 * @returns {string} - The name with proper capitalization.
 */
export const capitalizeName = (name) => {
    return name
        .split('-')
        .map(word => {
            if (word.includes(':')) {
                return word.split(':').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(': ');
            }
            if (word.includes("'")) {
                return word.split("'").map(part => part.charAt(0).toUpperCase() + part.slice(1)).join("'");
            }
            return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ');
};

/**
 * Converts a Pokémon's display name to its API-compatible name.
 * Applies corrections or formats the name into a lowercase, hyphen-separated string.
 * 
 * @param {string} displayName - The Pokémon's display name.
 * @returns {string} - The API-compatible name.
 */
export const getApiName = (displayName) => {
    return NAME_CORRECTIONS[displayName] || displayName.toLowerCase().replace(/ /g, '-');
}

/**
 * Determines the display name for a Pokémon based on its API name.
 * Uses name corrections or falls back to the `capitalizeName` function.
 * 
 * @param {string} apiName - The Pokémon's API name.
 * @returns {string} - The standardized display name.
 */
export const getDisplayName = (apiName) => {
    const correctedName = Object.keys(NAME_CORRECTIONS).find(key => NAME_CORRECTIONS[key] === apiName);
    return correctedName || capitalizeName(apiName);
};

/**
 * Debounce function to delay the execution of a callback.
 * Useful for optimizing search or input-related performance.
 * 
 * @param {Function} func - The function to debounce.
 * @param {number} delay - The delay in milliseconds.
 * @returns {Function} - A debounced version of the input function.
 */
export const debounce = (func, delay) => {
    let debounceTimer;
    return function (...args) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func(...args), delay);
    }
};

/**
 * Creates a dropdown menu and a filter function for Pokémon data.
 * Dynamically populates the dropdown and returns a filter handler for the selected option.
 * 
 * @param {Object} options - Configuration for the dropdown and filter.
 * @param {string} options.dropdownSelector - CSS selector for the dropdown element.
 * @param {Function} options.fetchData - Async function to fetch data for the dropdown.
 * @param {Function} options.capitalizeName - Function to format item names for display.
 * @param {string} options.filterKey - Key to filter Pokémon data by.
 * @param {Function} options.filterFunction - Custom filter logic.
 * @returns {Function} - A function to filter Pokémon based on the selected dropdown value.
 */
export const createDropdownAndFilter = ({ dropdownSelector, fetchData, capitalizeName, filterKey, filterFunction }) => {
    const dropdown = document.querySelector(dropdownSelector);

    // Populate the dropdown menu with options fetched from the data source
    const populateDropdown = async () => {
        const data = await fetchData();
        console.log(data)
        const items = data ? data.results.map(item => item.name) : [];

        items.forEach(item => {
            const option = document.createElement('option');
            option.value = item;
            option.textContent = capitalizeName(item);
            dropdown.appendChild(option);
        });
    };

    // Filter Pokémon data based on the selected dropdown value
    const handleFilter = (pokemonList) => {
        const selectedValue = dropdown.value;

        if (!selectedValue) return pokemonList;

        return pokemonList.filter(pokemon => filterFunction(pokemon, selectedValue, filterKey));
    };

    // Populate dropdown when the page loads.
    populateDropdown();

    return handleFilter;
};