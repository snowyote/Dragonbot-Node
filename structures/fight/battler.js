const Utils = require('../../core/utils.js');
const choices = ['attack', 'defend', 'magic', 'heal', 'run'];

module.exports = class Battler {
	constructor(battle, user) {
		this.battle = battle;
		this.user = user;
		this.bot = user.bot;
		this.hp = 100;
		this.mp = 100;
		this.guard = false;
	}

	async chooseAction(msg) {
		if (this.bot) {
			const botChoices = ['attack', 'defend'];
			if (this.canHeal && this.hp < 200) botChoices.push('heal');
			if (this.canMagic) botChoices.push('magic');
			return botChoices[Math.floor(Math.random() * botChoices.length)];
		}
		
		let content = `${this}, do you ${Utils.list(choices.map(choice => `**${choice}**`), 'or')}? You have **${this.mp}** MP!\n**${this.battle.user.user.tag}:** ${this.battle.user.hp} HP\n**${this.battle.opponent.user.tag}:** ${this.battle.opponent.hp} HP`;
		if (this.battle.turn === 1 || this.battle.turn === 2) {
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
