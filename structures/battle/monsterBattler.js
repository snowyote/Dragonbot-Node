const Utils = require('../../core/utils.js');

module.exports.MonsterBattler = class MonsterBattler {
	constructor(battle, monsterID) {
		this.monster = monsterID;
		this.hp = 100;
		this.mp = 100;
		this.name = "";
		this.guard = false;
		this.prBonus = 0;
		this.preBonus = 0;
		this.impBonus = 0;
		this.agiBonus = 0;
		this.forBonus = 0;
	}

	async chooseAction(msg) {
		const monsterChoices = ['attack', 'attack', 'attack', 'defend'];
		if (this.canHeal && this.hp < 50) monsterChoices.push('heal');
		if (this.canMagic) monsterChoices.push('magic');
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
};
