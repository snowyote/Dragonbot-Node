const { Command } = require('discord.js-commando');
const Utils = require('../../core/utils.js');
const Discord = require('discord.js');
const { SlotMachine, SlotSymbol } = require('slot-machine');

module.exports = class ChipsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'chips',
            group: 'casino',
            memberName: 'chips',
            description: 'Buy or sell casino chips!',
            examples: ['chips type amount'],
			args: [
			{
				key: 'type',
				prompt: 'What do you want to do: **buy** or **sell**?',
				type: 'string',
				oneOf: ['buy', 'sell']
			},
			{
				key: 'amount',
				prompt: 'How many chips?',
				type: 'integer',
				validate: amount => {
					if(amount > 0) return true;
					return 'Amount of chips is below 1!';
				}
			}]
        });
    }
	
	    async run(msg, {type,amount}) {
			const embedMsg = new Discord.RichEmbed()
				.setAuthor("House of Dragons Casino", "https://i.imgur.com/CyAb3mV.png")
				.setColor("#FDF018")
				.setDescription("<@"+msg.author.id+">")
			if (await Utils.getLocType(msg.author) == 'casino') {
				let userRes = await Utils.queryDB("SELECT * FROM users WHERE discordID=" + msg.author.id);	
				
				let chips = userRes[0].casinoChips;
				let coins = userRes[0].coins;
				
				if(type === 'buy') {
					if(coins >= amount) {
						await Utils.takeCoins(msg.author.id, amount);
						await Utils.giveChips(msg.author.id, amount);
						return msg.embed(await Utils.makeRPGEmbed("Bought Chips!", "You successfully bought **"+amount+"** casino chips!"));
					} 
					else 
						return msg.embed(await Utils.makeRPGEmbed("Can't Buy Chips!", "You have **"+coins+"** coins, you need **"+amount+"** to buy that many casino chips!"));
				}
				if(type === 'sell') {
					if(chips >= amount) {
						await Utils.takeChips(msg.author.id, amount);
						await Utils.giveCoins(msg.author.id, amount);
						return msg.embed(await Utils.makeRPGEmbed("Sold Chips!", "You successfully cashed in **"+amount+"** casino chips!"));
					}
					else
						return msg.embed(await Utils.makeRPGEmbed("Can't Sell Chips!", "You have **"+chips+"** casino chips, you need **"+amount+"** to cash in that many casino chips!"));
				}
				
			} else {
				embedMsg.addField("Not In Casino", "You need to be in a casino to use this, find one on the `!map`!");
				return msg.embed(embedMsg);
			}
		};
}