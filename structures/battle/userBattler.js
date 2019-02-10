const Utils = require('../../core/utils.js');
const choices = ['attack', 'fortify', 'counter', 'focus', 'stance', 'magic', 'heal', 'run'];

module.exports.UserBattler = class UserBattler {
	constructor(battle, user) {
		this.battle = battle;
		this.user = user;
		this.name = user.username;
		this.hp = 100;
		this.hasForfeit = false;
		this.maxHP = 100;
		this.mp = 100;
		this.stance = 0;
		this.maxMP = 100;
		this.guard = false;
		this.counter = false;
		this.focus = false;
		this.stunned = false;
		this.prBonus = 0;
		this.preBonus = 0;
		this.impBonus = 0;
		this.agiBonus = 0;
		this.forBonus = 0;
	}

	async chooseAction(msg) {
		let content = `${this}, do you ${Utils.list(choices.map(choice => `**${choice}**`), 'or')}? You have **${this.mp}**/**${this.maxMP}** MP!\n**${this.battle.user.name}:** ${this.battle.user.hp}/${this.battle.user.maxHP} HP\n**${this.battle.opponent.name}:** ${this.battle.opponent.hp}/${this.battle.opponent.maxHP} HP`;
		if (this.battle.turn === 1 || this.battle.turn === 2) {
			this.stunned = false;
			content += '\n\n**Magic:** 50 MP, magical attack ignoring enemy fortitude'+
			'\n**Heal:** regain HP for your remaining MP'+
			'\n**Fortify:** regain 25 MP every turn while fortifying'+
			'\n**Counter:** evade and retaliate if you are attacked, take double damage from magic'+
			'\n**Focus:** skip a turn to triple your damage'+
			'\n**Run:** run from the fight';
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
	
	addMP(amount) {
		this.mp += amount;
		return this.mp;
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

	changeCounter() {
		this.counter = !this.counter;
		return this.counter;
	}

	changeFocus() {
		this.focus = !this.focus;
		return this.focus;
	}
	
	changeStance() {
		if(this.stance <= 3) this.stance++;
		else this.stance = 0;
	}
	
	getStance() {
		if(this.stance == 0) return 'Balanced';
		if(this.stance == 1) return 'Defensive';
		if(this.stance == 2) return 'Offensive';
		if(this.stance == 3) return 'Evasive';
		return 'None';
	}

	forfeit() {
		this.hp = 0;
		this.hasForfeit = true;
		return null;
	}
	
	get canHeal() {
		return (this.hp < this.maxHP);
	}

	get canMagic() {
		return this.mp >= 50;
	}

	toString() {
		return this.user.toString();
	}
};
