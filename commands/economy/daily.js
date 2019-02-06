const { Command } = require('discord.js-commando');
const Utils = require('../../core/utils.js');
const Discord = require('discord.js');

module.exports = class DailyCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'daily',
            group: 'economy',
            memberName: 'daily',
            description: 'Get a daily coin bonus!',
            examples: ['daily']
        });
    }
	
	    async run(msg) {
			const authorID = msg.author.id;
			const embedMsg = new Discord.RichEmbed()
				.setAuthor("House of Dragons Daily Bonus", "https://i.imgur.com/CyAb3mV.png")
			
			var dailyTime = await Utils.queryDB("SELECT * FROM users WHERE discordID="+authorID);
			var currentTime = Utils.getTimestamp();
			var lastDailyTime = dailyTime[0].timeSinceDaily;
			var income = dailyTime[0].income;
			var timeVar = parseInt(lastDailyTime - currentTime);
			var formattedTime = Utils.formatTimeUntil(lastDailyTime);
			
			if(currentTime > lastDailyTime) {
				var randomCoins = Utils.randomIntIn(1000,5000)*income;
				var newTime = Utils.getTimestamp() + 86400000;
				timeVar = parseInt(newTime - currentTime);
				formattedTime = Utils.formatTimeUntil(newTime);
				await Utils.queryDB("UPDATE users SET timeSinceDaily="+newTime+", coins=coins+"+randomCoins+" WHERE discordID="+authorID);
				Utils.log("\x1b[36m%s\x1b[0m", "DB: Successfully claimed Daily Bonus for "+authorID+"!");
				embedMsg.addField("Claimed!","You claimed your daily bonus and got awarded **"+randomCoins+" coins**!");
				return msg.embed(embedMsg);
			} else {
				embedMsg.addField("Cannot do this yet!","You have to wait **"+formattedTime+"** before claiming your daily bonus!");
				return msg.embed(embedMsg);
			}
		}
};