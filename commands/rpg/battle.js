const {
    Command
} = require('discord.js-commando');
const Battle = require('../../structures/battle/battle.js');
const Utils = require('../../core/utils.js');

module.exports = class BattleCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'battle',
			aliases: ['fight', 'death-battle'],
			group: 'rpg',
			memberName: 'battle',
			description: 'Engage in a battle against another user or a monster',
			args: [
				{
					key: 'opponent',
					prompt: 'What user would you like to battle?',
					type: 'user',
					default: () => this.client.user
				}
			]
		});

		this.battles = new Map();
	}

	async run(msg, { opponent }) {
		if (opponent.id === msg.author.id) return msg.reply(`You can't battle yourself.`);
		if (this.battles.has(msg.channel.id)) return msg.reply('Only one battle may be occurring per channel.');
		this.battles.set(msg.channel.id, new Battle(msg.author, opponent));
		const battle = this.battles.get(msg.channel.id);
		try {
			if (!opponent.bot) {
				await msg.say(`${opponent}, do you accept this challenge?`);
				const verification = await Utils.verify(msg.channel, opponent);
				if (!verification) {
					this.battles.delete(msg.channel.id);
					return msg.say('Looks like they declined...');
				}
			}
			while (!battle.winner) {
				const choice = await battle.attacker.chooseAction(msg);
				if (choice === 'attack') {
					let atkBonus = await Utils.calculateProwess(battle.attacker.user.id);
					let preBonus = await Utils.calculatePrecision(battle.attacker.user.id);
					let impBonus = await Utils.calculateImpact(battle.attacker.user.id);
					let aglBonus = await Utils.calculateAgility(battle.defender.user.id);
					let defBonus = await Utils.calculateFortitude(battle.defender.user.id);
					
					let multiplier = 1;
					let missed = 0;
					let stunned = 0;
					
					let random = Utils.randomIntIn(1,100);
					if(random <= Math.floor(aglBonus/2))
						missed = 1;
					
					random = Utils.randomIntIn(1,100);
					if(random <= Math.floor(preBonus/2))
						multiplier = 2;
					
					random = Utils.randomIntIn(1,100);
					if(random <= Math.floor(impBonus/2))
						stunned = 1;
					
					let dmgMin = 20 + (Math.floor(atkBonus/2) - Math.floor(defBonus/2))*multiplier;
					let dmgMinGuard = 5 + (Math.floor(atkBonus/2) - Math.floor(defBonus))*multiplier;
					let dmgMax = 50 + (Math.floor(atkBonus) - Math.floor(defBonus/2))*multiplier;
					let dmgMaxGuard = 20 + (Math.floor(atkBonus) - Math.floor(defBonus))*multiplier;
					
					let damage = Utils.randomIntIn(battle.defender.guard ? dmgMinGuard : dmgMin, battle.defender.guard ? dmgMaxGuard : dmgMax);
					
					if(damage < 0) damage = 0;
					
					if(missed) {
						await msg.say(`${battle.attacker} missed!`);
						battle.reset();
					} else if(stunned) {
						await msg.say(`${battle.attacker} deals **${damage}** impact damage, causing ${battle.defender} to miss a turn!`);
						battle.defender.dealDamage(damage);
						battle.reset();
						battle.reset();
					} else {
						if(multiplier == 2) await msg.say(`${battle.attacker} ***critically hit***, dealing **${damage}** damage!`);
						else await msg.say(`${battle.attacker} deals **${damage}** damage!`);
						battle.defender.dealDamage(damage);
						battle.reset();
					}
				} else if (choice === 'defend') {
					await msg.say(`${battle.attacker} defends!`);
					battle.attacker.changeGuard();
					battle.reset(false);
				} else if (choice === 'heal') {
					const amount = Utils.randomIntIn(0,100-battle.attacker.hp);
					await msg.say(`${battle.attacker} heals **${amount}** HP!`);
					battle.attacker.heal(amount);
					battle.attacker.useMP(battle.attacker.mp);
					battle.reset();
				} else if (choice === 'run') {
					await msg.say(`${battle.attacker} flees!`);
					battle.attacker.forfeit();
				} else if (choice === 'failed:time') {
					await msg.say(`Time's up, ${battle.attacker}!`);
					battle.reset();
				} else {
					await msg.say('I do not understand what you want to do.');
				}
			}
			const { winner } = battle;
			this.battles.delete(msg.channel.id);
			return msg.say(`The match is over! ${winner} is the victor!`);
		} catch (err) {
			this.battles.delete(msg.channel.id);
			throw err;
		}
	}
};
