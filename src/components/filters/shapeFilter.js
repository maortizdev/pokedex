import { fetchAllShapes } from "../../services/api.js";
import { capitalizeName } from "../../utils/helpers.js";
import { createDropdownAndFilter } from "../../utils/helpers.js";

const filterByShape = (pokemon, selectedShape) => pokemon.shape === selectedShape;

export const handleShapeFilter = createDropdownAndFilter({
    dropdownSelector: '#shape-dropdown',
    fetchData: fetchAllShapes,
    capitalizeName,
    filterKey: 'shape',
    filterFunction: filterByShape
});