const {Command} = require('discord.js-commando');
const Utils = require('../../core/utils.js');
const Discord = require('discord.js');
const { PerformanceObserver, performance } = require('perf_hooks');

module.exports = class MapCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'map',
            group: 'rpg',
            memberName: 'map',
            description: 'View the map',
            examples: ['map']
        });
    }

    async run(msg) {
		let t0 = performance.now();
		const userRes = await Utils.queryDB("SELECT * FROM users WHERE discordID="+msg.author.id);
		let buffer, tiles, coords;
		if(await Utils.isInDungeon(msg.author.id)) {
			coords = JSON.parse(userRes[0].dungeon_location);
			tiles = await Utils.queryDB("SELECT * FROM locations_dungeon WHERE coords='"+JSON.stringify(coords)+"'");
			console.log("DB: Generating dungeon map centered at x"+coords[0]+" y"+coords[1]);
			buffer = await Utils.generateDungeonMap(coords[0], coords[1], msg.author);
		} else {
			coords = JSON.parse(userRes[0].location);
			tiles = await Utils.queryDB("SELECT * FROM locations WHERE coords='"+JSON.stringify(coords)+"'");
			console.log("DB: Generating overworld map centered at x"+coords[0]+" y"+coords[1]);
			buffer = await Utils.generateMap(coords[0], coords[1], msg.author);			
		}
		
		const embedMsg = new Discord.RichEmbed()
                  .setAuthor("World of the House of Dragons ["+coords[0]+","+coords[1]+"]", "https://i.imgur.com/CyAb3mV.png")
				  
		embedMsg.attachFiles(buffer);
		if(tiles[0].lore.length > 0) {
				embedMsg.addField(tiles[0].name, tiles[0].lore);
				embedMsg.addField("Options", await Utils.RPGOptions(msg.author));
			} else {
				embedMsg.addField(tiles[0].name, await Utils.RPGOptions(msg.author));
		}
		await msg.embed(embedMsg);
		let t1 = performance.now();
		Utils.log("\x1b[45m%s\x1b[0m", "Generating map took " + ((t1 - t0)/1000).toFixed(2) + " seconds!");
    };
}