// todo: fix the ability Filter here, in api.js and the helper function


import { fetchAllAbilities } from "../../services/api.js";
import { capitalizeName } from "../../utils/helpers.js";
import { createDropdownAndFilter } from "../../utils/helpers.js";

const filterByAbility = (pokemon, selectedAbility) =>
    pokemon.abilities.some(a => a.ability.name === selectedAbility);

export const handleAbilityFilter = createDropdownAndFilter({
    dropdownSelector: '#ability-dropdown',
    fetchData: fetchAllAbilities,
    capitalizeName,
    filterKey: 'ability',
    filterFunction: filterByAbility
});