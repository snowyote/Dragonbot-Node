const {Command} = require('discord.js-commando');
const Utils = require('../../core/utils.js');
const Discord = require('discord.js');

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
				  
		const userRes = await Utils.queryDB("SELECT * FROM users WHERE discordID="+msg.author.id);
		let coords = JSON.parse(userRes[0].location);
		const tiles = await Utils.queryDB("SELECT * FROM locations WHERE coords='"+JSON.stringify(coords)+"'");
		console.log("DB: Generating map centered at x"+coords[0]+" y"+coords[1]);
		let buffer = await Utils.generateMap(coords[0], coords[1], msg.author);
		
		const embedMsg = new Discord.RichEmbed()
                  .setAuthor("World of the House of Dragons ["+coords[0]+","+coords[1]+"]", "https://i.imgur.com/CyAb3mV.png")
				  
		embedMsg.attachFiles(buffer);
		if(tiles[0].lore.length > 0) {
				embedMsg.addField(tiles[0].name, tiles[0].lore);
				embedMsg.addField("Options", Utils.RPGOptions(tiles[0].type));
			} else {
				embedMsg.addField(tiles[0].name, Utils.RPGOptions(tiles[0].type));
		}
		return msg.embed(embedMsg);
    };
}