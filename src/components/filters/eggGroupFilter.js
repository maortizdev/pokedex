import { fetchAllEggGroups } from "../../services/api.js";
import { capitalizeName } from "../../utils/helpers.js";
import { createDropdownAndFilter } from "../../utils/helpers.js";

const filterByEggGroup = (pokemon, selectedEggGroup) => pokemon.eggGroup && pokemon.eggGroup.includes(selectedEggGroup);

export const handleEggGroupFilter = createDropdownAndFilter({
    dropdownSelector: '#egg-group-dropdown',
    fetchData: fetchAllEggGroups,
    capitalizeName,
    filterKey: 'egg_group',
    filterFunction: filterByEggGroup
});