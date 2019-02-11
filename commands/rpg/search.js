const {
    Command
} = require('discord.js-commando');
const Utils = require('../../core/utils.js');
const Discord = require('discord.js');

module.exports = class SearchCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'search',
			group: 'rpg',
			memberName: 'search',
			description: 'Search something',
            examples: ['search']
		});
		
		this.battles = new Map();
	}

	async run(msg) {
		if(await Utils.isInBattle(msg.author)) {
			return msg.say("You're in a battle, finish that before using this command!");
		}
		const embedMsg = new Discord.RichEmbed()
			.setAuthor("World of the House of Dragons", "https://i.imgur.com/CyAb3mV.png")
			
		if(await Utils.canUseAction(msg.author, 'search')) {
			if(await Utils.hasActivatedTile(msg.author.id, await Utils.getTileID(msg.author))) {
				return msg.embed(Utils.makeRPGEmbed("Can't Search", "You already searched here!"));
			} else {
				let drops = await Utils.searchRewards(msg.author);
				let name = await Utils.getDungeonLocName(msg.author);
				msg.embed(Utils.makeRPGEmbed("Searched "+name, "<@" + msg.author.id + "> found:\n"+drops));
				await Utils.activateTile(msg.author, await Utils.getTileID(msg.author));
			}
		} else {
			embedMsg.addField("Can't Search", "There's nothing to search here!");
			return msg.embed(embedMsg);
		}
	};
}