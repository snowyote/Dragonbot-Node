const Utils = require('../../core/utils.js');

module.exports.MonsterBattler = class MonsterBattler {
	constructor(battle, monsterID) {
		this.monster = monsterID;
		this.hp = 100;
		this.name = "";
		this.guard = false;
		this.prBonus = 0;
		this.preBonus = 0;
		this.impBonus = 0;
		this.agiBonus = 0;
		this.forBonus = 0;
	}

	async chooseAction(msg) {
		const monsterChoices = ['attack', 'defend'];
		//if (this.canHeal && this.hp < 100) monsterChoices.push('heal');
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
		return true;
	}
};
