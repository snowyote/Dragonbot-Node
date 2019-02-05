const {
    Command
} = require('discord.js-commando');
const Utils = require('../../core/utils.js');
const Discord = require('discord.js');

module.exports = class SharpenCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'sharpen',
            group: 'pet',
            memberName: 'sharpen',
            description: 'Sharpen your woodcutting axe',
            examples: ['sharpen']
        });
    }

    async run(msg) {
		const embedMsg = new Discord.RichEmbed()
            .setAuthor("House of Dragons Notice", "https://i.imgur.com/CyAb3mV.png")

        let queryRes = await Utils.queryDB("SELECT * FROM users WHERE discordID=" + msg.author.id);
        var active = queryRes[0].activePet;
		var gems = JSON.parse(queryRes[0].gems);
		let petRes = await Utils.queryDB("SELECT * FROM pets WHERE id="+active);
		var tools = JSON.parse(queryRes[0].tools);
		if(tools.length > 0) {
			var hasSharpener = 0;
			Utils.log("\x1b[36m%s\x1b[0m", "DB: Tools includes: "+tools);
			if(tools.includes(4)) hasSharpener = 1;
			if(hasSharpener) {
				var userID = queryRes[0].id;
				var sharpness = petRes[0].axeSharpness;
				
				if(sharpness < 100) {
					var gemsRequired = Math.ceil((100 - sharpness)/3);
					if(gems[0] >= gemsRequired) {
						gems[0] -= gemsRequired;
						await Utils.queryDB("UPDATE pets SET axeSharpness=100 WHERE id="+active);
						await Utils.queryDB("UPDATE users SET gems='"+JSON.stringify(gems)+"' WHERE discordID="+msg.author.id);
						embedMsg.addField("Axe Sharpened", "You threw **"+gemsRequired+"** gemstone shard(s) into the sharpener, fully sharpening your axe!");
						return msg.embed(embedMsg);
					} else {
						embedMsg.addField("Can't Sharpen", "You need **"+gemsRequired+"** gemstone shard(s) to sharpen your axe!");
						return msg.embed(embedMsg);
					}
				} else {
					embedMsg.addField("Can't Sharpen", "Your axe is sharp enough already!");
					return msg.embed(embedMsg);
				}
			} else {
				embedMsg.addField("Can't Sharpen", "You don't have an axe sharpener! Buy one in the `hod?market`!");
				return msg.embed(embedMsg);
			}
		} else {
			embedMsg.addField("Can't Sharpen", "You don't have an axe sharpener! Buy one in the `hod?market`!");
			return msg.embed(embedMsg);
		}
    };
}