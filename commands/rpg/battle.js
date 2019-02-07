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
			let monsterName = await BattleUtils.getMonsterName(48);
			let battle = await BattleUtils.battle(msg, 48, this.battles);
			if(battle === monsterName) {
				embedMsg.addField("You Lost!", "<@"+msg.author.id+"> was defeated by the **"+monsterName+"**. After some time unconscious, you wake up back in Dragonstone Village...");
				return msg.embed(embedMsg);
				await Utils.queryDB("UPDATE users SET location='[0,0]' WHERE discordID="+msg.author.id);
			} else {
				embedMsg.addField("You Won!", "<@"+msg.author.id+"> defeated the **"+monsterName+"**!");
				let drop = await BattleUtils.randomDrop(msg.author, 48);
				if(!drop) {
					embedMsg.addField("Loot", "*No loot!*");
				} else {
					let dropArray = drop.split('-');
					let dropID = parseInt(dropArray[1]);
					if(dropArray[0] == "quest") {
						if(await Utils.hasQuestItem(msg.author.id, dropID) == false) {
							await Utils.addQuestItem(msg.author.id, dropID);
							embedMsg.addField("Loot", await Utils.getQuestItem(dropID, true));
						} else {
							embedMsg.addField("Loot", "*No loot!*");
						}
					} else {
						await Utils.addItem(msg.author.id, dropID);
						embedMsg.addField("Loot", await Utils.getQuestItem(dropID, true));
					}
				}
				return msg.embed(embedMsg);
			}
		} else {
			embedMsg.addField("Can't Battle", "There's nothing here for you to battle!");
			return msg.embed(embedMsg);
		}
	};
}