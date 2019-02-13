const items = require('../../data/equipment.js');
const Utils = require('../../core/utils.js');

module.exports.Item = class Item {
    constructor(playerLevel) {
        this.level = playerLevel;
        this.name = "";
        this.type = "";
		this.rarity = "";
        this.bonus = 0;
        this.level_requirement = 1;
        this.prowess = 0;
        this.fortitude = 0;
        this.agility = 0;
        this.arcana = 0;
        this.impact = 0;
        this.precision = 0;
        this.vitality = 0;
    }

    generateItem() {
        const rarityRandom = Math.round(Utils.randomIntIn(0, 100) - (this.level / 5));
        const itemRarities = items.rarity.filter(itemRarity => itemRarity.rarity >= rarityRandom);
        const randomRarity = Utils.randomIntEx(0, itemRarities.length);
		
        const modifierRandom = Math.round(Utils.randomIntIn(itemRarities[randomRarity].rarity_min, 100) - (this.level / 5));
        const materialRandom = Math.round(Utils.randomIntIn(itemRarities[randomRarity].rarity_min, 100) - (this.level / 5));
        const suffixRandom = Math.round(Utils.randomIntIn(itemRarities[randomRarity].rarity_min, 100) - (this.level / 5));
        const itemModifiers = items.modifier.filter(itemModifier => itemModifier.rarity >= modifierRandom);
        const itemMaterials = items.material.filter(itemMaterial => itemMaterial.rarity >= materialRandom);
        const itemSuffixes = items.suffix.filter(itemSuffix => itemSuffix.rarity >= suffixRandom);

        const randomModifier = Utils.randomIntEx(0, itemModifiers.length);
        const randomMaterial = Utils.randomIntEx(0, itemMaterials.length);
        const randomSuffix = Utils.randomIntEx(0, itemSuffixes.length);

        let randomEquip = Utils.randomIntEx(0, items.type.length);
        let randomType = Utils.randomIntEx(0, items.type[randomEquip].length);
        let itemType = items.type[randomEquip][randomType];
		
		let isCommon = (itemRarities[randomRarity].name == 'Common') ? true : false;
		let isMagic = (itemRarities[randomRarity].name == 'Magic') ? true : false;
		let isRare = (itemRarities[randomRarity].name == 'Rare') ? true : false;
		let isUnique = (itemRarities[randomRarity].name == 'Unique') ? true : false;

        if (!itemType.hasOwnProperty('prowess'))
            itemType.prowess = 0;
        if (!itemType.hasOwnProperty('fortitude'))
            itemType.fortitude = 0;
        if (!itemType.hasOwnProperty('agility'))
            itemType.agility = 0;
        if (!itemType.hasOwnProperty('arcana'))
            itemType.arcana = 0;
        if (!itemType.hasOwnProperty('vitality'))
            itemType.vitality = 0;
        if (!itemType.hasOwnProperty('impact'))
            itemType.impact = 0;
        if (!itemType.hasOwnProperty('precision'))
            itemType.precision = 0;

        if (!itemSuffixes[randomSuffix].hasOwnProperty('prowess'))
            itemSuffixes[randomSuffix].prowess = 0;
        if (!itemSuffixes[randomSuffix].hasOwnProperty('fortitude'))
            itemSuffixes[randomSuffix].fortitude = 0;
        if (!itemSuffixes[randomSuffix].hasOwnProperty('agility'))
            itemSuffixes[randomSuffix].agility = 0;
        if (!itemSuffixes[randomSuffix].hasOwnProperty('arcana'))
            itemSuffixes[randomSuffix].arcana = 0;
        if (!itemSuffixes[randomSuffix].hasOwnProperty('vitality'))
            itemSuffixes[randomSuffix].vitality = 0;
        if (!itemSuffixes[randomSuffix].hasOwnProperty('impact'))
            itemSuffixes[randomSuffix].impact = 0;
        if (!itemSuffixes[randomSuffix].hasOwnProperty('precision'))
            itemSuffixes[randomSuffix].precision = 0;

        let levelReq = 0;
		
		if(!isCommon) levelReq = (itemModifiers[randomModifier].level_modifier + itemMaterials[randomMaterial].level_modifier + itemSuffixes[randomSuffix].level_modifier + itemRarities[randomRarity].level_modifier) * itemRarities[randomRarity].level_multiplier;
		else levelReq = (itemModifiers[randomModifier].level_modifier + itemMaterials[randomMaterial].level_modifier + itemRarities[randomRarity].level_modifier) * itemRarities[randomRarity].level_multiplier;
		
        if (levelReq < 1) levelReq = 1;

        this.name = !isCommon ? `${itemModifiers[randomModifier].name} ${itemMaterials[randomMaterial].name} ${itemType.name} ${itemSuffixes[randomSuffix].name}` : `${itemModifiers[randomModifier].name} ${itemMaterials[randomMaterial].name} ${itemType.name}`;
		this.rarity = itemRarities[randomRarity].name;
        this.type = itemType.type;
		this.bonus = (isRare || isUnique) ? itemModifiers[randomModifier].bonus + itemRarities[randomRarity].bonus + itemMaterials[randomMaterial].bonus : 0;
        this.level_requirement = levelReq;
        this.prowess = !isCommon ? itemType.prowess + itemSuffixes[randomSuffix].prowess : itemType.prowess;
        this.fortitude = !isCommon ? itemType.fortitude + itemSuffixes[randomSuffix].fortitude : itemType.fortitude;
        this.agility = !isCommon ? itemType.agility + itemSuffixes[randomSuffix].agility : itemType.agility;
        this.arcana = !isCommon ? itemType.arcana + itemSuffixes[randomSuffix].arcana : itemType.arcana;
        this.vitality = !isCommon ? itemType.vitality + itemSuffixes[randomSuffix].vitality : itemType.vitality;
        this.impact = !isCommon ? itemType.impact + itemSuffixes[randomSuffix].impact : itemType.impact;
        this.precision = !isCommon ? itemType.precision + itemSuffixes[randomSuffix].precision : itemType.precision;
    }
}