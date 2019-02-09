const Utils = require('../../core/utils.js');
const choices = ['attack', 'defend', 'magic', 'heal'];

module.exports.UserBattler = class UserBattler {
	constructor(battle, user) {
		this.battle = battle;
		this.user = user;
		this.name = user.username;
		this.hp = 100;
		this.mp = 100;
		this.guard = false;
		this.stunned = false;
		this.prBonus = 0;
		this.preBonus = 0;
		this.impBonus = 0;
		this.agiBonus = 0;
		this.forBonus = 0;
	}

	async chooseAction(msg) {		
		let content = `${this}, do you ${Utils.list(choices.map(choice => `**${choice}**`), 'or')}? You have **${this.mp}** MP!\n**${this.battle.user.name}:** ${this.battle.user.hp} HP\n**${this.battle.opponent.name}:** ${this.battle.opponent.hp} HP`;
		if (this.battle.turn === 1 || this.battle.turn === 2) {
			this.stunned = false;
			content += '\n\n*Magic always uses 50 MP and ignores enemy defense. Cure heals you for your remaining MP.*';
		}
		
		await msg.say(content);
		const filter = res => {
			const choice = res.content.toLowerCase();
			if (res.author.id === this.user.id && choices.includes(choice)) {
				return true;
			}
			return false;
		};
		const turn = await msg.channel.awaitMessages(filter, {
			max: 1,
			time: 30000
		});
		if (!turn.size) return 'failed:time';
		return turn.first().content.toLowerCase();
	}

	dealDamage(amount) {
		this.hp -= amount;
		return this.hp;
	}

	heal(amount) {
		this.hp += amount;
		return this.hp;
	}

	useMP(amount) {
		this.mp -= amount;
		return this.mp;
	}

	changeStunned() {
		this.stunned = !this.stunned;
		return this.stunned;
	}

	changeGuard() {
		this.guard = !this.guard;
		return this.guard;
	}

	forfeit() {
		this.hp = 0;
		return null;
	}
	
	get canHeal() {
		return this.mp > 0;
	}

	get canMagic() {
		return this.mp >= 50;
	}

	toString() {
		return this.user.toString();
	}
};
