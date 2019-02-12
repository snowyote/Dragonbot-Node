const {
    Command
} = require('discord.js-commando');
const BattleUtils = require('../../core/battleUtils.js');
const Utils = require('../../core/utils.js');
const Discord = require('discord.js');

module.exports = class TournamentCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'tournament',
			group: 'rpg',
			memberName: 'tournament',
			description: 'Engage in a town tournament'
		});
		
		this.battles = new Map();
	}

	async run(msg) {
		const embedMsg = new Discord.RichEmbed()
			.setAuthor("World of the House of Dragons", "https://i.imgur.com/CyAb3mV.png")
		let formattedTime = "";
		if((formattedTime = await Utils.canUseAction(msg.author, 'tournament')) == true) {
			if(await Utils.canTournament(msg.author.id)) {
				let alive = true;
				let counter = 0;
				let finalXP = 0;
				while(alive && counter < 10) {
					let monsterToFight = await Utils.getRandomMonster(msg.author, false, false, true, false);
					if((finalXP += await BattleUtils.battle(msg, monsterToFight, this.battles, true, true)) !== false) {
						counter++;
					}
					else alive = false;
				}
				if(alive) {
					embedMsg.addField("Tournament Won", "You won the tournament!");
					await Utils.giveXP(msg, msg.author.id, finalXP);
					let dbUserID = await Utils.getUserID(msg.author.id, true);
					let tournamentTime = new Date().getTime() + 600000;
					await Utils.queryDB("UPDATE rpg_flags SET lastTournament="+tournamentTime+" WHERE userID="+dbUserID);
					return msg.embed(embedMsg);
				} else {
					embedMsg.addField("Tournament Lost", "You lost the tournament!");
					return msg.embed(embedMsg);
				}
			} else {
				embedMsg.addField("Can't Enter Tournament", "You can join the tournament again in **"+formattedTime+"**!");
				return msg.embed(embedMsg);
			}
		} else {
			embedMsg.addField("Can't Enter Tournament", "There's no tournament here!");
			return msg.embed(embedMsg);
		}
	};
}