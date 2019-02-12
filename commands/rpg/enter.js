const {
    Command
} = require('discord.js-commando');
const Utils = require('../../core/utils.js');
const Discord = require('discord.js');

module.exports = class EnterCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'enter',
			group: 'rpg',
			memberName: 'enter',
			description: 'Enter a dungeon',
            examples: ['enter']
		});
		
		this.battles = new Map();
	}

	async run(msg) {
		if(await Utils.isInBattle(msg.author)) {
			return msg.say("You're in a battle, finish that before using this command!");
		}
		const embedMsg = new Discord.RichEmbed()
			.setAuthor("World of the House of Dragons", "https://i.imgur.com/CyAb3mV.png")
			
		if(await Utils.canUseAction(msg.author, 'enter')) {			
			await Utils.queryDB("UPDATE users SET inDungeon=1 WHERE discordID="+msg.author.id);
			await Utils.dungeonTeleport(msg.author.id, 0, 0, true, await Utils.getWarp(msg.author));
			return msg.embed(Utils.makeRPGEmbed("Entered Dungeon", "You entered the dungeon!"));
		} else {
			embedMsg.addField("Can't Exit", "There's no exit here, find one on the `!map`!");
			return msg.embed(embedMsg);
		}
	};
}