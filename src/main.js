import { setUpSearchListener } from "./components/searchHandler.js";
import { populateUIComponents, handleApplyFiltersListeners } from "./components/filtersHandler.js"
import { loadPokemon } from "./services/pokemonLoader.js";


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

initializeApp();