const {
    Command
} = require('discord.js-commando');
const Utils = require('../../core/utils.js');
const Discord = require('discord.js');

module.exports = class SailCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'sail',
			group: 'rpg',
			memberName: 'sail',
			description: 'Sail on an boat',
            examples: ['sail']
		});
		
		this.battles = new Map();
	}

	async run(msg) {
		if(await Utils.isInBattle(msg.author)) {
			return msg.say("You're in a battle, finish that before using this command!");
		}
		const embedMsg = new Discord.RichEmbed()
			.setAuthor("World of the House of Dragons", "https://i.imgur.com/CyAb3mV.png")
			
		if(await Utils.canUseAction(msg.author, 'sail')) {			
			await Utils.teleport(msg.author.id, 0, 0, true, await Utils.getWarp(msg.author));
			return msg.embed(Utils.makeRPGEmbed("Sailed!", "You arrived at the destination!"));
		} else {
			embedMsg.addField("Can't Sail", "There's no boat here, find one on the `!map`!");
			return msg.embed(embedMsg);
		}
	};
}