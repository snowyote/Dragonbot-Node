const {
    Command
} = require('discord.js-commando');
const Utils = require('../../core/utils.js');
const Discord = require('discord.js');

module.exports = class LeaderboardCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'leaderboard',
			aliases: ['top', 'leader', 'board'],
            group: 'pet',
            memberName: 'leaderboard',
            description: 'View pet leaderboards',
            examples: ['leaderboard <type>'],
            args: [
			{
                key: 'type',
                prompt: 'What type of leaderboard?',
                type: 'string',
				default: ''
			}]
        });
    }

    async run(msg, {type}) {
		const embedMsg = new Discord.RichEmbed()
            .setAuthor("House of Dragons Leaderboards", "https://i.imgur.com/CyAb3mV.png")

		var emojis = ["🥇","🥈","🥉","🏵️","🏵️","🏵️","🏵️","🏵️","🏵️"];
		if(type.length > 0) {
			if(type.toLowerCase() === "level") {
				let petRes = await Utils.queryDB("SELECT * FROM pet_types");
				let userRes = await Utils.queryDB("SELECT * FROM users WHERE activePet > 0");
				let queryRes = await Utils.queryDB("SELECT * FROM pets ORDER BY level DESC LIMIT 9");
				
				for(var i = 0; i < queryRes.length; i++) {
					embedMsg.addField(emojis[i]+" Rank #"+(i+1),
					"**Name:** "+queryRes[i].name+
					"\n**Type:** "+petRes[queryRes[i].petType-1].name+
					"\n**Level:** "+queryRes[i].level, true);
				}
			} else if(type.toLowerCase() === "mining") {
				let petRes = await Utils.queryDB("SELECT * FROM pet_types");
				let userRes = await Utils.queryDB("SELECT * FROM users WHERE activePet > 0");
				let queryRes = await Utils.queryDB("SELECT * FROM pets ORDER BY caveDepth DESC LIMIT 9");
				var km = 0;
				for(var i = 0; i < queryRes.length; i++) {
					km = ((queryRes[i].caveDepth)/1000).toFixed(2);
					embedMsg.addField(emojis[i]+" Rank #"+(i+1),
					"**Name:** "+queryRes[i].name+
					"\n**Cave Depth:** "+km+"km", true);
				}
			} else {
				embedMsg.addField("Please Choose a Leaderboard", "`!leaderboard <type>` - you can choose `level` or `mining`");
			}
		} else {
			embedMsg.addField("Please Choose a Leaderboard", "`!leaderboard <type>` - you can choose `level` or `mining`");
		}
		
		return msg.embed(embedMsg);
	};
}