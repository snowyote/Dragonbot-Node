const { Command } = require('discord.js-commando');
const Utils = require('../../core/utils.js');
const Discord = require('discord.js');

module.exports = class RepCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'rep',
            group: 'profile',
            memberName: 'rep',
            description: 'Give someone a reputation point!',
            examples: ['rep @user'],
			args: [
			{
				key: 'user',
				prompt: 'Which user do you want to give a reputation point?',
				type: 'user'
			}]
        });
    }
	
	    async run(msg, {user}) {
			if(msg.author.id === user.id) {
				return msg.say("You can't give yourself a reputation point!");
			} else {
				const embedMsg = new Discord.RichEmbed()
					.setAuthor("House of Dragons Reputation", "https://i.imgur.com/CyAb3mV.png")

				let repTime = await Utils.queryDB("SELECT timeSinceRep FROM users WHERE discordID="+msg.author.id);
				var currentTime = Utils.getTimestamp();
				var lastRepTime = repTime[0].timeSinceRep;
				var formattedTime = Utils.formatTimeUntil(lastRepTime);
					
				if(currentTime > lastRepTime) {
					var newTime = Utils.getTimestamp() + 21600000;
					formattedTime = Utils.formatTimeUntil(newTime);
					await Utils.queryDB("UPDATE users SET timeSinceRep="+newTime+" WHERE discordID ="+msg.author.id);
					await Utils.queryDB("UPDATE users SET reputation=reputation+1 WHERE discordID ="+user.id);
					embedMsg.addField("Reputation Given","**<@"+msg.author.id+">** gave **<@"+user.id+">** a reputation point!\n(You can do this again in *"+formattedTime+"*!)");
					return msg.embed(embedMsg);
				} else {
					embedMsg.addField("Cannot do this yet!","You have to wait **"+formattedTime+"** before giving a reputation point!");
					return msg.embed(embedMsg);
				}
			}
		}
};