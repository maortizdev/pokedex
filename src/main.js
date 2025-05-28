import { setUpSearchListener } from "./components/searchHandler.js";
import { populateUIComponents, handleApplyFiltersListeners } from "./components/filtersHandler.js"
import { loadPokemon } from "./services/pokemonLoader.js";

/**
 * Initializes the application by setting up the UI, loading data, 
 * and attaching event listeners for search and filter functionalities.
 * 
 * Wraps the initialization in a try-catch block to handle and log 
 * any errors that might occur during setup.
 */
const initializeApp = () => {
    try {
        populateUIComponents();
        loadPokemon();
        setUpSearchListener();
        handleApplyFiltersListeners();
    } catch (error) {
        console.error('Failed to initialize the app: ', error);
    }
};

// Start the application
initializeApp();