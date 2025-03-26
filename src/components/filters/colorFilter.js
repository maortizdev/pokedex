import { fetchAllColors } from "../../services/api.js";
import { capitalizeName } from "../../utils/helpers.js";
import { createDropdownAndFilter } from "../../utils/helpers.js";

const filterByColor = (pokemon, selectedColor) => pokemon.color === selectedColor;

export const handleColorFilter = createDropdownAndFilter({
    dropdownSelector: '#color-dropdown',
    fetchData: fetchAllColors,
    capitalizeName,
    filterKey: 'color',
    filterFunction: filterByColor
});