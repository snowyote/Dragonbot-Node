const monsterBattler = require('./monsterBattler');
const userBattler = require('./monsterBattlerUser');

module.exports = class MonsterBattle {
	constructor(user, monsterID) {
		this.user = new userBattler(this, user);
		this.opponent = new monsterBattler(this, monsterID);
		this.userTurn = false;
		this.turn = 1;
	}

	get attacker() {
		return this.userTurn ? this.user : this.opponent;
	}

	get defender() {
		return this.userTurn ? this.opponent : this.user;
	}

	reset(changeGuard = true) {
		if (changeGuard && this.user.guard) this.user.changeGuard();
		if (changeGuard && this.opponent.guard) this.opponent.changeGuard();
		this.userTurn = !this.userTurn;
		this.turn++;
		return this.turn;
	}

	get winner() {
		if (this.user.hp <= 0) return this.opponent;
		if (this.opponent.hp <= 0) return this.user;
		return null;
	}
};
