const items = require('../../data/equipment.js');
const Utils = require('../../core/utils.js');

module.exports.Item = class Item {

    generateItem(userID) {
        return new Promise((resolve) => {
            let playerLevel = await Utils.getLevel(userID);
            const modifierRandom = Math.round(Utils.randomIntIn(0, 100) - (playerLevel / 5));
            const materialRandom = Math.round(Utils.randomIntIn(0, 100) - (playerLevel / 5));
            const itemModifiers = items.modifier.filter(itemModifier => itemModifier.rarity >= modifierRandom);
            const itemMaterials = items.material.filter(itemMaterial => itemMaterial.rarity >= materialRandom);

            const randomModifier = Utils.randomIntEx(0, itemModifiers.length);
            const randomMaterial = Utils.randomIntEx(0, itemMaterials.length);

            let randomEquip = Utils.randomIntEx(0, items.type.length);
            let randomType = Utils.randomIntEx(0, items.type[randomEquip].length);
            let itemType = items.type[randomEquip][randomType];
			
			if(!itemType.hasOwnProperty('prowess')) itemType.prowess = 0;
			if(!itemType.hasOwnProperty('fortitude')) itemType.fortitude = 0;
			if(!itemType.hasOwnProperty('agility')) itemType.agility = 0;
			if(!itemType.hasOwnProperty('arcana')) itemType.arcana = 0;
			if(!itemType.hasOwnProperty('vitality')) itemType.vitality = 0;
			if(!itemType.hasOwnProperty('impact')) itemType.impact = 0;
			if(!itemType.hasOwnProperty('precision')) itemType.precision = 0;

            let item = {
                    name: `${itemModifiers[randomModifier].name} ${itemMaterials[randomMaterial].name} ${itemType.name}`,
                    type: itemType.type,
                    bonus: itemModifiers[randomModifier].bonus + itemMaterials[randomMaterial].bonus,
                    prowess: 0 + itemType.prowess,
                    fortitude: 0 + itemType.fortitude,
                    agility: 0 + itemType.agility,
                    arcana: 0 + itemType.arcana,
                    vitality: 0 + itemType.vitality,
                    impact: 0 + itemType.impact,
                    precision: 0 + itemType.precision
                };
            }

            return resolve(item);
        });
    }
	
    get items() {
        return items.type;
    }

}