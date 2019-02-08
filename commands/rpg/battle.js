const {
    Command
} = require('discord.js-commando');
const BattleUtils = require('../../core/battleUtils.js');
const Utils = require('../../core/utils.js');
const Discord = require('discord.js');

module.exports = class BattleCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'battle',
			group: 'rpg',
			memberName: 'battle',
			description: 'Engage in a battle against an NPC or monster'
		});
		
		this.battles = new Map();
	}

	async run(msg) {
		const embedMsg = new Discord.RichEmbed()
			.setAuthor("World of the House of Dragons", "https://i.imgur.com/CyAb3mV.png")
			
		if(await Utils.canUseAction(msg.author, 'battle')) {
			let monsterToFight = await Utils.getRandomMonster(msg.author);
			let battle = await BattleUtils.battle(msg, monsterToFight, this.battles);
		} else {
			embedMsg.addField("Can't Battle", "There's nothing here for you to battle!");
			return msg.embed(embedMsg);
		}
	};
}