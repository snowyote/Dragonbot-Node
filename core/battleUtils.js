const Utils = require("./utils.js");
const {MonsterBattle} = require('../structures/battle/monsterBattle.js');

async function getMonsterHP(monsterID) {
    const monsterRes = await Utils.queryDB("SELECT health FROM monsters WHERE id=" + monsterID);
    return monsterRes[0].health;
}

async function getMonsterName(monsterID) {
    const monsterRes = await Utils.queryDB("SELECT name FROM monsters WHERE id=" + monsterID);
    return monsterRes[0].name;
}

async function getMonsterStats(monsterID) {
    const monsterRes = await Utils.queryDB("SELECT * FROM monsters WHERE id=" + monsterID);
    let monsterStats = new Array();
    monsterStats.push(monsterRes[0].prowess, monsterRes[0].fortitude, monsterRes[0].agility, monsterRes[0].impact, monsterRes[0].precise);
    return monsterStats;
}

async function monsterBonus(skill) {
    const skillMultiplier = 5;
    return skill * skillMultiplier;
}

async function randomDrop(user, monsterID) {
    let dropChance = Utils.randomIntIn(1,100);
	let monRes = await Utils.queryDB("SELECT * FROM monsters WHERE id="+monsterID);
	let dropList = JSON.parse(monRes[0].drops);
	let dropRate = monRes[0].dropRate;
	let questDropList = JSON.parse(monRes[0].questDrops);
	if(dropChance <= dropRate) {
		if(questDropList.length > 0) {
			let randomDrop = Utils.randomIntEx(0,questDropList.length);
			let questItemRes = await Utils.queryDB("SELECT * FROM quest_items WHERE id="+questDropList[randomDrop]);
			if(await Utils.isInQuest(user) == questItemRes[0].questID)
				return 'quest-'+questDropList[randomDrop];
			else {
				Utils.log("Not in the right quest for the drop!");
				return false;
			}
		}
		if(dropList.length > 0) {
			let randomDrop = Utils.randomIntEx(0,dropList.length);
			let questItemRes = await Utils.queryDB("SELECT * FROM items WHERE id="+dropList[randomDrop]);
			return 'quest-'+dropList[randomDrop];			
		}
	} return false;
}

async function battle(msg, monsterID, battleMap) {
    if (battleMap.has(msg.channel.id)) return msg.reply('Only one battle may be occurring per channel.');
	if (await Utils.isInBattle(msg.author)) return msg.reply('You are already in a battle!');
    battleMap.set(msg.channel.id, new MonsterBattle(msg.author, monsterID));
    const battle = battleMap.get(msg.channel.id);
	await Utils.setInBattle(msg.author, 1);
	
    // User stuff
    battle.user.prBonus = await Utils.calculateProwess(msg.author.id);
    battle.user.preBonus = await Utils.calculatePrecision(msg.author.id);
    battle.user.impBonus = await Utils.calculateImpact(msg.author.id);
    battle.user.agiBonus = await Utils.calculateAgility(msg.author.id);
    battle.user.forBonus = await Utils.calculateFortitude(msg.author.id);

    // Monster stuff
    battle.opponent.hp = await getMonsterHP(monsterID);
    battle.opponent.name = await getMonsterName(monsterID);

    let monsterStats = await getMonsterStats(monsterID);
    battle.opponent.prBonus = await monsterBonus(monsterStats[0]);
    battle.opponent.forBonus = await monsterBonus(monsterStats[1]);
    battle.opponent.agiBonus = await monsterBonus(monsterStats[2]);
    battle.opponent.impBonus = await monsterBonus(monsterStats[3]);
    battle.opponent.preBonus = await monsterBonus(monsterStats[4]);

    while (!battle.winner) {
        const choice = await battle.attacker.chooseAction(msg);
        if (choice === 'attack') {
            let multiplier = 1;
            let missed = 0;
            let stunned = 0;

            let random = Utils.randomIntIn(1, 100);
            if (random <= Math.floor(battle.defender.agiBonus))
                missed = 1;

            random = Utils.randomIntIn(1, 100);
            if (random <= Math.floor(battle.attacker.preBonus/2))
                multiplier = 2;

            random = Utils.randomIntIn(1, 100);
            if (random <= Math.floor(battle.attacker.impBonus/1.5))
                stunned = 1;
			
            let dmgMin = 10 + (Math.floor(battle.attacker.prBonus / 2) - Math.floor(battle.defender.forBonus / 2)) * multiplier;
            let dmgMinGuard = 5 + (Math.floor(battle.attacker.prBonus / 2) - Math.floor(battle.defender.forBonus)) * multiplier;
            let dmgMax = 30 + (Math.floor(battle.attacker.prBonus) - Math.floor(battle.defender.forBonus / 2)) * multiplier;
            let dmgMaxGuard = 15 + (Math.floor(battle.attacker.prBonus) - Math.floor(battle.defender.forBonus)) * multiplier;

            let damage = Utils.randomIntIn(battle.defender.guard ? dmgMinGuard : dmgMin, battle.defender.guard ? dmgMaxGuard : dmgMax);

            if (damage < 0) damage = 0;

            if (missed) {
                await msg.say(`${battle.attacker.name} missed!`);
                battle.reset();
            } else if (stunned) {
                await msg.say(`${battle.attacker.name} deals **${damage}** impact damage, causing ${battle.defender.name} to miss a turn!`);
                battle.defender.dealDamage(damage);
                battle.reset();
                battle.reset();
            } else {
                if (multiplier == 2) await msg.say(`${battle.attacker.name} ***critically hit***, dealing **${damage}** damage!`);
                else await msg.say(`${battle.attacker.name} deals **${damage}** damage!`);
                battle.defender.dealDamage(damage);
                battle.reset();
            }
        } else if (choice === 'defend') {
            await msg.say(`${battle.attacker.name} is now on guard!`);
            battle.attacker.changeGuard();
            battle.reset(false);
        } else if (choice === 'heal') {
            const amount = Utils.randomIntIn(0, 100 - battle.attacker.hp);
            await msg.say(`${battle.attacker.name} heals **${amount}** HP!`);
            battle.attacker.heal(amount);
            battle.attacker.useMP(battle.attacker.mp);
            battle.reset();
        } else if (choice === 'run') {
            await msg.say(`${battle.attacker.name} flees!`);
            battle.attacker.forfeit();
        } else if (choice === 'failed:time') {
            await msg.say(`Time's up, ${battle.attacker.name}!`);
            battle.reset();
        } else {
            await msg.say('I do not understand what you want to do.');
        }
    }
    const {
        winner
    } = battle;
	await Utils.setInBattle(msg.author, 0);
    battleMap.delete(msg.channel.id);
    return {winner};
}

// --
// Export functions
// --

module.exports = {
	battle,
	getMonsterName,
	randomDrop
};