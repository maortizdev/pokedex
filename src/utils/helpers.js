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
 * Splits the name by hyphens, capitalizes the first letter of each part, and rejoins them.
 * Handles special characters like ':', "'", and the Nidoran sex symbols.
 *
 * @param {string} name - The Pokémon name in lowercase, hyphen-separated format.
 * @returns {string} - The name with each part capitalized and joined with spaces.
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

export const getApiName = (displayName) => {
    return NAME_CORRECTIONS[displayName] || displayName.toLowerCase().replace(/ /g, '-');
}
/**
 * Determines the display name for a Pokémon based on its API name.
 * Applies form corrections, name corrections, or falls back to capitalizing the API name.
 *
 * @param {string} apiName - The Pokémon name as provided by the API.
 * @returns {string} - The standardized display name of the Pokémon.
 */
export const getDisplayName = (apiName) => {
    const correctedName = Object.keys(NAME_CORRECTIONS).find(key => NAME_CORRECTIONS[key] === apiName);
    return correctedName || capitalizeName(apiName);
};


// Debounce function for search input to optimize performance
export const debounce = (func, delay) => {
    let debounceTimer;
    return function (...args) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func(...args), delay);
    }
};

export const createDropdownAndFilter = ({ dropdownSelector, fetchData, capitalizeName, filterKey, filterFunction }) => {
    const dropdown = document.querySelector(dropdownSelector);

    // Populate dropdown
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

    // Filter Function
    const handleFilter = (pokemonList) => {
        const selectedValue = dropdown.value;

        if (!selectedValue) return pokemonList;

        return pokemonList.filter(pokemon => filterFunction(pokemon, selectedValue, filterKey));
    };

    // Populate dropdown when the page loads.
    populateDropdown();

    return handleFilter;
};