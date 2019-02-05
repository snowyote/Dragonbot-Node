const {Command} = require('discord.js-commando');
const Utils = require('../../core/utils.js');
const Discord = require('discord.js');

module.exports = class RecycleCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'recycle',
            group: 'pet',
            memberName: 'recycle',
            description: 'Recycle trash',
            examples: ['recycle']
        });
    }

    async run(msg) {
		const embedMsg = new Discord.RichEmbed()
            .setAuthor("House of Dragons Notice", "https://i.imgur.com/CyAb3mV.png")

        let queryRes = await Utils.queryDB("SELECT * FROM users WHERE discordID=" + msg.author.id);
        var trash = queryRes[0].trash;
		var tools = JSON.parse(queryRes[0].tools);
		if(tools.length > 0) {
			var hasRecycler = 0;
			Utils.log("\x1b[36m%s\x1b[0m", "DB: Tools includes: "+tools);
			if(tools.includes(3)) hasRecycler = 1;
			if(hasRecycler) {
				var userID = queryRes[0].id;
				Utils.log("\x1b[36m%s\x1b[0m", "DB: Selected user ID " + msg.author.id);
				if(trash > 0) {
					var coinsGained = Math.floor(trash*0.75);
					await Utils.queryDB("UPDATE users SET trash=0, coins=coins+"+coinsGained+" WHERE discordID="+msg.author.id);
					await Utils.queryDB("UPDATE achievement_progress SET coinsGained=coinsGained+"+coinsGained+", trashRecycled=trashRecycled+"+trash+" WHERE id="+userID);
					embedMsg.addField("Trash Recycled", "You recycled **"+trash+"** pieces of trash and gained **"+coinsGained+"** coins!");
					return msg.embed(embedMsg);
				} else {
					embedMsg.addField("Can't Recycle", "You have no trash to recycle!");
					return msg.embed(embedMsg);
				}
			} else {
				embedMsg.addField("Can't Recycle", "You don't have a recycler! Buy one in the `hod?market`!");
				return msg.embed(embedMsg);
			}
		} else {
			embedMsg.addField("Can't Recycle", "You don't have a recycler! Buy one in the `hod?market`!");
			return msg.embed(embedMsg);
		}
    };
}