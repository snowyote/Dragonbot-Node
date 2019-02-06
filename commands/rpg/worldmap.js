const {Command} = require('discord.js-commando');
const Utils = require('../../core/utils.js');
const Discord = require('discord.js');

module.exports = class WorldMapCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'worldmap',
            group: 'rpg',
            memberName: 'worldmap',
            description: 'View the full world map',
            examples: ['worldmap']
        });
    }

    async run(msg) {
		console.log("DB: Generating full world map");
		let buffer = await Utils.generateWorldMap();
		
		const embedMsg = new Discord.RichEmbed()
                  .setAuthor("World of the House of Dragons", "https://i.imgur.com/CyAb3mV.png")
				  
		embedMsg.attachFiles(buffer);
		return msg.embed(embedMsg);
    };
}