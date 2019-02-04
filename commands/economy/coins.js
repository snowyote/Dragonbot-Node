const { Command } = require('discord.js-commando');
const Utils = require('../../core/utils.js');
const Discord = require('discord.js');

module.exports = class GiveCoinsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'coins',
            group: 'economy',
            memberName: 'coins',
            description: 'See how many coins you have!',
            examples: ['coins']
        });
    }
	
	    async run(msg) {
			const embedMsg = new Discord.RichEmbed()
				.setAuthor("House of Dragons Economy", "https://i.imgur.com/CyAb3mV.png")
					
			let userRes = await Utils.queryDB("SELECT * FROM users WHERE discordID=" + msg.author.id);
			var coins = userRes[0].coins;
			embedMsg.addField("Coins", "<@"+msg.author.id+">, you have **"+coins+"** coins!");
			return msg.embed(embedMsg);
		}
};