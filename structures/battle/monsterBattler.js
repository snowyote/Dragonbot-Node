const Utils = require('../../core/utils.js');

module.exports.MonsterBattler = class MonsterBattler {
	constructor(battle, monsterID) {
		this.battle = battle;
		this.monster = monsterID;
		this.hp = 100;
		this.maxHP = 100;
		this.mp = 100;
		this.maxMP = 100;
		this.hasForfeit = false;
		this.name = "";
		this.stance = 0;
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
		const monsterChoices = [];
		if (this.focus) monsterChoices.push('attack', 'attack');
		else monsterChoices.push('focus', 'attack', 'counter');
		if (this.battle.user.counter) monsterChoices.push('focus', 'counter');
		if (this.canHeal) monsterChoices.push('heal');
		if (this.canMagic) monsterChoices.push('magic');
		if (this.mp <= (this.maxMP/10) || this.hp <= (this.maxHP/10)) monsterChoices.push('fortify');
		if (this.hp <= (this.maxHP/10)) monsterChoices.push('run');
		this.stunned = false;
		return monsterChoices[Math.floor(Math.random() * monsterChoices.length)];
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
	
	getStance() {
		if(this.stance == 0) return 'Balanced';
		if(this.stance == 1) return 'Defensive';
		if(this.stance == 2) return 'Offensive';
		if(this.stance == 3) return 'Evasive';
		return 'None';
	}

	useMP(amount) {
		this.mp -= amount;
		return this.mp;
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

	forfeit() {
		this.hp = 0;
		this.hasForfeit = true;
		return null;
	}
	
	get canHeal() {
		return (this.hp < this.maxHP && this.mp > 0);
	}

	get canMagic() {
		return this.mp >= 50;
	}
};
