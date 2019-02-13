const {
    Command
} = require('discord.js-commando');
const Utils = require('../../core/utils.js');
const BattleUtils = require('../../core/battleUtils.js');
const Discord = require('discord.js');

module.exports = class TouchCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'touch',
			group: 'quest',
			memberName: 'touch',
			description: 'Touch something',
            examples: ['touch']
		});
		
		this.battles = new Map();
	}

	async run(msg) {
		if(await Utils.isInBattle(msg.author)) {
			return msg.say("You're in a battle, finish that before using this command!");
		}
		const embedMsg = new Discord.RichEmbed()
			.setAuthor("World of the House of Dragons", "https://i.imgur.com/CyAb3mV.png")
			
		if(await Utils.canUseAction(msg.author, 'touch')) {
			let name = await Utils.getDungeonLocName(msg.author);
			if(await Utils.hasActivatedTile(msg.author.id, await Utils.getTileID(msg.author))) {
				return msg.embed(Utils.makeRPGEmbed("Touched "+name, "...nothing happens!"));
			} else {
				var location = await Utils.getDungeonLocation(msg.author);
				let x = location[0];
				let y = location[1];
				
				// Touched the ALTAR OF BONES
				if(x==7 && y==0) {
					if(await Utils.isInQuest(msg.author) == 3) {
						if(await BattleUtils.battle(msg, 1, this.battles, false, false, true) == false) {
							return msg.embed(Utils.makeRPGEmbed("The Darkness Lingers", "You could not stop the darkness."));
						} else {
							await Utils.activateTile(msg.author, await Utils.getTileID(msg.author));
							return msg.embed(Utils.makeRPGEmbed("The Darkness Recedes", "The catacombs have been cleansed of the evil presence!"));
						}
					} else {
						embedMsg.addField("Touched "+name, "...nothing happens!");
					}
				}
				
				// Touched the STOLEN GOLD
				if(x==12 && y==4) {
					if(await Utils.isInQuest(msg.author) == 4) {
						if(await BattleUtils.battle(msg, 2, this.battles, false, false, true) !== false) {
							await Utils.activateTile(msg.author, await Utils.getTileID(msg.author));
							return msg.embed(Utils.makeRPGEmbed("Reclaimed Stolen Gold", "You obtained Taposa's stolen gold!"));
						}
					} else {
						embedMsg.addField("Touched "+name, "...nothing happens!");
					}
				}
								
			}
		} else {
			embedMsg.addField("Can't Search", "There's nothing to search here!");
			return msg.embed(embedMsg);
		}
	};
}