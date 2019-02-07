const {
    Command
} = require('discord.js-commando');
const Utils = require('../../core/utils.js');

module.exports = class BattleCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'battle',
			group: 'rpg',
			memberName: 'battle',
			description: 'Engage in a battle against an NPC or monster'
		});

	}

	async run(msg) {
		await Utils.battle(msg, 48);
	};
}