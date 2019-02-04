const { Command } = require('discord.js-commando');
const Utils = require('../../core/utils.js');
const Discord = require('discord.js');

module.exports = class GiveCoinsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'givecoins',
            group: 'economy',
            memberName: 'givecoins',
            description: 'Give someone some coins!',
            examples: ['givecoins @user amount'],
			args: [
			{
				key: 'user',
				prompt: 'Which user do you want to give a reputation point?',
				type: 'user'
			},
			{
				key: 'amount',
				prompt: 'How many coins do you want to give them?',
				type: 'integer',
				validate: amount => {
					if(amount > 0) return true;
					return 'Amount of coins is below 1!';
				}
			}]
        });
    }
	
	    async run(msg, {user, amount}) {
			if(msg.author.id === user.id) {
				return msg.say("You can't give coins to yourself!");
			} else {
				const embedMsg = new Discord.RichEmbed()
					.setAuthor("House of Dragons Economy", "https://i.imgur.com/CyAb3mV.png")
					
				let userRes = await Utils.queryDB("SELECT * FROM users WHERE discordID=" + msg.author.id);
				var coins = userRes[0].coins;
				if(coins >= amount) {
					await Utils.queryDB("UPDATE users SET coins=coins-"+amount+" WHERE discordID=" + msg.author.id);
					await Utils.queryDB("UPDATE users SET coins=coins+"+amount+" WHERE discordID=" + user.id);
					embedMsg.addField("Gave Coins", "<@"+msg.author.id+"> gave **"+amount+"** coins to <@"+user.id+">!");
					return msg.embed(embedMsg);
				} else {
					embedMsg.addField("Can't Give Coins", "You don't have that many coins to give!");
					return msg.embed(embedMsg);
				}
			}
		}
};