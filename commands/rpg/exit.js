const {
    Command
} = require('discord.js-commando');
const Utils = require('../../core/utils.js');
const Discord = require('discord.js');

module.exports = class ExitCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'exit',
			group: 'rpg',
			memberName: 'exit',
			description: 'Exit a dungeon',
            examples: ['exit']
		});
		
		this.battles = new Map();
	}

	async run(msg) {
		if(await Utils.isInBattle(msg.author)) {
			return msg.say("You're in a battle, finish that before using this command!");
		}
		const embedMsg = new Discord.RichEmbed()
			.setAuthor("World of the House of Dragons", "https://i.imgur.com/CyAb3mV.png")
			
		if(await Utils.canUseAction(msg.author, 'exit')) {
			await Utils.queryDB("UPDATE users SET inDungeon=0 WHERE discordID="+msg.author.id);
			await Utils.teleport(msg.author.id, 0, 0, true, await Utils.getDungeonWarp(msg.author));
			return msg.embed(Utils.makeRPGEmbed("Exited Dungeon", "You exited the dungeon!"));
		} else {
			embedMsg.addField("Can't Exit", "There's no exit here, find one on the `!map`!");
			return msg.embed(embedMsg);
		}
	};
}