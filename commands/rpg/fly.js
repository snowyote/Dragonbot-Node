const {
    Command
} = require('discord.js-commando');
const Utils = require('../../core/utils.js');
const Discord = require('discord.js');

module.exports = class FlyCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'fly',
			group: 'rpg',
			memberName: 'fly',
			description: 'Fly on an airship',
            examples: ['fly']
		});
		
		this.battles = new Map();
	}

	async run(msg) {
		if(await Utils.isInBattle(msg.author)) {
			return msg.say("You're in a battle, finish that before using this command!");
		}
		const embedMsg = new Discord.RichEmbed()
			.setAuthor("World of the House of Dragons", "https://i.imgur.com/CyAb3mV.png")
			
		if(await Utils.canUseAction(msg.author, 'fly')) {		
			if(await Utils.hasQuestItem(msg.author.id, 6)) {	
				await Utils.teleport(msg.author.id, 0, 0, true, await Utils.getWarp(msg.author));
				return msg.embed(Utils.makeRPGEmbed("Travelled by Airship", "You arrived at the destination!"));
			} else
				return msg.embed(Utils.makeRPGEmbed("Guard", "I'm afraid you can't fly to the snowlands, unless you have some kind of **written permission**."));
		} else {
			embedMsg.addField("Can't Fly", "There's no airship here, find one on the `!map`!");
			return msg.embed(embedMsg);
		}
	};
}