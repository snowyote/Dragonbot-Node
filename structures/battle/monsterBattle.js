const {MonsterBattler} = require('./monsterBattler');
const {UserBattler} = require('./userBattler');

module.exports.MonsterBattle = class MonsterBattle {
	constructor(user, monsterID) {
		this.user = new UserBattler(this, user);
		this.opponent = new MonsterBattler(this, monsterID);
		this.userTurn = true;
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
		if (this.user.hp <= 0) return this.opponent.name;
		if (this.opponent.hp <= 0) return this.user.name;
		return null;
	}
};
