const {MonsterBattler} = require('./monsterBattler');
const {UserBattler} = require('./userBattler');

module.exports.MonsterBattle = class MonsterBattle {
	constructor(user, monsterID) {
		this.user = new UserBattler(this, user);
		this.opponent = new MonsterBattler(this, monsterID);
		this.userTurn = false;
		this.turn = 1;
	}

	get attacker() {
		return this.userTurn ? this.user : this.opponent;
	}

	get defender() {
		return this.userTurn ? this.opponent : this.user;
	}

	reset(changeGuard = true, changeFocus = false, changeCounter = true) {
		if(this.user.guard) {
			if(this.user.mp < this.user.maxMP) this.user.addMP(12.5);
			if(this.user.mp > this.user.maxMP) this.user.mp = this.user.maxMP;
		}
		if(this.opponent.guard) {
			if(this.opponent.mp < this.opponent.maxMP) this.opponent.addMP(12.5);
			if(this.opponent.mp > this.opponent.maxMP) this.opponent.mp = this.opponent.maxMP;
		}
		if (changeGuard && this.user.guard) this.user.changeGuard();
		if (changeGuard && this.opponent.guard) this.opponent.changeGuard();
		if (changeCounter && this.user.counter) this.user.changeCounter();
		if (changeCounter && this.opponent.counter) this.opponent.changeCounter();
		if (changeFocus && this.user.focus) this.user.changeFocus();
		if (changeFocus && this.opponent.focus) this.opponent.changeFocus();
		this.userTurn = !this.userTurn;
		this.turn++;
		return this.turn;
	}

	get winner() {
		if (this.user.hp <= 0) return this.opponent.name;
		if (this.opponent.hp <= 0) return this.user;
		return null;
	}
};
