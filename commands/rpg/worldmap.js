const {Command} = require('discord.js-commando');
const Utils = require('../../core/utils.js');
const Discord = require('discord.js');
const { PerformanceObserver, performance } = require('perf_hooks');

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
		let t0 = performance.now();
		let buffer = await Utils.generateWorldMap();
		
		const embedMsg = new Discord.RichEmbed()
                  .setAuthor("World of the House of Dragons", "https://i.imgur.com/CyAb3mV.png")
				  
		embedMsg.attachFiles(buffer);
		await msg.embed(embedMsg);
		let t1 = performance.now();
		Utils.log("\x1b[45m%s\x1b[0m", "Generating world map took " + ((t1 - t0)/1000).toFixed(2) + " seconds!");
    };
}