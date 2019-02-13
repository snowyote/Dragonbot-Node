const {Command} = require('discord.js-commando');
const Utils = require('../../core/utils.js');
const {Item} = require('../../structures/rpg/item');
const Discord = require('discord.js');

module.exports = class RandomItemCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'randomitem',
            group: 'rpg',
            memberName: 'randomitem',
            description: 'Show a random item for testing purposes',
            examples: ['randomitem']
        });
    }

    async run(msg) {
		const embedMsg = new Discord.RichEmbed()
                  .setAuthor("World of the House of Dragons", "https://i.imgur.com/CyAb3mV.png")
		
		let playerLevel = await Utils.getLevel(msg.author.id);
		let item = new Item(playerLevel);
		item.generateItem(playerLevel);
		
		embedMsg.addField("Generated Item", 
			`**Name:** ${item.name}
			**Type:** ${item.type}
			**Rarity:** ${item.rarity}
			**Min Level:** ${item.level_requirement}
			
			**Prowess:** ${item.prowess+item.bonus}
			**Fortitude:** ${item.fortitude+item.bonus}
			**Agility:** ${item.agility+item.bonus}
			**Arcana:** ${item.arcana+item.bonus}
			**Vitality:** ${item.vitality+item.bonus}
			**Impact:** ${item.impact+item.bonus}
			**Precision:** ${item.precision+item.bonus}`);
		
		return msg.embed(embedMsg);
    };
}