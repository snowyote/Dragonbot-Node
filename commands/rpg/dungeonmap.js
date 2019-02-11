const {Command} = require('discord.js-commando');
const Utils = require('../../core/utils.js');
const Discord = require('discord.js');

module.exports = class DungeonMapCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'dungeonmap',
            group: 'rpg',
            memberName: 'dungeonmap',
            description: 'View the full dungeon map',
            examples: ['dungeonmap'],
			userPermissions: ['MANAGE_MESSAGES']
        });
    }

    async run(msg) {
		console.log("DB: Generating full dungeon world map");
		let buffer = await Utils.generateDungeonWorldMap();
		
		const embedMsg = new Discord.RichEmbed()
                  .setAuthor("World of the House of Dragons", "https://i.imgur.com/CyAb3mV.png")
				  
		embedMsg.attachFiles(buffer);
		return msg.embed(embedMsg);
    };
}