const Utils = require("./utils.js");
const {
    MonsterBattle
} = require('../structures/battle/monsterBattle.js');

async function getMonsterHP(monsterID) {
    const monsterRes = await Utils.queryDB("SELECT health FROM monsters WHERE id=" + monsterID);
    return monsterRes[0].health;
}

async function getMonsterMP(monsterID) {
    const monsterRes = await Utils.queryDB("SELECT magic FROM monsters WHERE id=" + monsterID);
    return monsterRes[0].magic;
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
    let dropChance = Utils.randomIntIn(1, 100);
    let monRes = await Utils.queryDB("SELECT * FROM monsters WHERE id=" + monsterID);
    let dropList = JSON.parse(monRes[0].drops);
    let dropRate = monRes[0].dropRate;
    if (dropChance <= dropRate) {
        if (dropList.length > 0) {
            let randomDrop = Utils.randomIntEx(0, dropList.length);
			let drop = dropList[randomDrop];
			console.log(drop);
			let dropArray = drop.split('-');
			console.log(dropArray);
            return dropArray;
        }
    } else {
		return ["none","0","0"];
	}
}

async function randomDrops(user, monsterID, min, max) {
    let dropNum = Utils.randomIntIn(min, max);
    let questItems = new Array;
    let normalItems = new Array;
    let coins = 0;
    let food = 0;
    let orbs = 0;
    let keys = 0;
    let artifacts = 0;
    let logs = [0, 0, 0, 0, 0];
    let gems = [0, 0, 0, 0, 0];
    let crate = [0, 0, 0, 0, 0];
    for (let i = 0; i < dropNum; i++) {
        let dropArray = await randomDrop(user, monsterID);
		let dropID = parseInt(dropArray[1]);
		let typeID = parseInt(dropArray[2]);
        // Is quest item
        if (dropArray[0] == "quest") {
            if (await Utils.hasQuestItem(user.id, dropID) == false && !questItems.includes(dropID))
                questItems.push(dropID);
            // Is normal item
        } else if (dropArray[0] == "item") {
            if (await Utils.hasItem(user.id, dropID) == false && !normalItems.includes(dropID))
                normalItems.push(dropID);
            // Is coins
        } else if (dropArray[0] == "coins") {
			let avarice = await Utils.avariceBonus(user.id);
            coins += dropID * avarice;
            // Is mystic orb
        } else if (dropArray[0] == "orbs") {
            orbs += dropID;
            // Is key
        } else if (dropArray[0] == "keys") {
            keys += dropID;
            // Is artifact
        } else if (dropArray[0] == "artifacts") {
            artifacts += dropID;
            // Is log
        } else if (dropArray[0] == "logs") {
            crate[typeID] += dropID;
            // Is gem
        } else if (dropArray[0] == "gems") {
            gems[typeID] += dropID;
            // Is crate
        } else if (dropArray[0] == "crates") {
            crate[typeID] += dropID;
        }
    }

    // Make the strings and give the things
    let dropStr = "";

    if (normalItems.length > 0) {
        for (let i = 0; i < normalItems.length; i++) {
            dropStr = dropStr + await Utils.getItem(normalItems[i], true) + '\n';
            await Utils.addItem(user.id, normalItems[i]);
        }
    }

    if (questItems.length > 0) {
        for (let i = 0; i < questItems.length; i++) {
            dropStr = dropStr + await Utils.getQuestItem(questItems[i], true) + '\n';
            await Utils.addQuestItem(user.id, questItems[i]);
        }
    }

    if (coins > 0) {
        dropStr = dropStr + '**' + coins + '** coins\n';
        await Utils.giveCoins(user.id, coins);
    }

    if (food > 0) {
        dropStr = dropStr + '**' + food + '** food\n';
        await Utils.addFood(user.id, food);
    }

    if (orbs > 0) {
        dropStr = dropStr + '**' + orbs + '** mystic orbs\n';
        await Utils.addOrbs(user.id, orbs);
    }

    if (keys > 0) {
        dropStr = dropStr + '**' + keys + '** crate keys\n';
        await Utils.addKeys(user.id, keys);
    }

    if (artifacts > 0) {
        dropStr = dropStr + '**' + artifacts + '** ancient artifacts\n';
        await Utils.addArtifacts(user.id, artifacts);
    }

    for (let i = 0; i < 5; i++) {
        let type = '';
        if (logs[i] > 0) {
            type = await Utils.getLogType(i);
            dropStr = dropStr + '**' + logs[i] + '** ' + type.toLowerCase() + ' logs\n';
            await Utils.addLogs(user.id, i, logs[i]);
        }
        if (gems[i] > 0) {
            type = await Utils.getGemType(i);
            dropStr = dropStr + '**' + gems[i] + '** ' + type.toLowerCase() + ' gems\n';
            await Utils.addGems(user.id, i, gems[i]);
        }
        if (crate[i] > 0) {
            type = await Utils.getGemType(i);
            dropStr = dropStr + '**' + crate[i] + '** ' + type.toLowerCase() + ' crate\n';
            await Utils.addCrate(user.id, i, crate[i]);
        }
    }
	
	if(dropStr.length > 0) {
		dropStr = dropStr.slice(0,-1);
		return dropStr;
	} else {
		return "None!";
	}
}

async function randomEnemyStats(monsterID, isElite=false) {
	let health = Utils.randomIntIn(isElite ? 75 : 25, isElite ? 150 : 100);
	let magic = Utils.randomIntIn(isElite ? 50 : 25, isElite ? 150 : 50);
	
	var monsterStats = [0,0,0,0,0,100,100];
	
	monsterStats[0] = Utils.randomIntIn(isElite ? 4 : 1, isElite ? 8 : 4);
	monsterStats[1] = Utils.randomIntIn(isElite ? 4 : 1, isElite ? 8 : 4);
	monsterStats[2] = Utils.randomIntIn(isElite ? 4 : 1, isElite ? 8 : 4);
	monsterStats[3] = Utils.randomIntIn(isElite ? 4 : 1, isElite ? 8 : 4);
	monsterStats[4] = Utils.randomIntIn(isElite ? 4 : 1, isElite ? 8 : 4);
	
	monsterStats[5] = health;
	monsterStats[6] = magic;
	
	let monsterName = await getMonsterName(monsterID);
	monsterStats[7] = (isElite ? 'Elite '+monsterName : monsterName);
	return monsterStats;
}

async function battle(msg, monsterID, battleMap, random=false) {
    if (battleMap.has(msg.channel.id)) return msg.reply('Only one battle may be occurring per channel.');
    if (await Utils.isInBattle(msg.author)) return msg.reply('You are already in a battle!');
    battleMap.set(msg.channel.id, new MonsterBattle(msg.author, monsterID));
    const battle = battleMap.get(msg.channel.id);
    await Utils.setInBattle(msg.author, 1);

    // User stuff
    battle.user.hp = await Utils.calculateHP(msg.author.id);
    battle.user.mp = await Utils.calculateMP(msg.author.id);

    battle.user.prBonus = await Utils.calculateProwess(msg.author.id);
    battle.user.preBonus = await Utils.calculatePrecision(msg.author.id);
    battle.user.impBonus = await Utils.calculateImpact(msg.author.id);
    battle.user.agiBonus = await Utils.calculateAgility(msg.author.id);
    battle.user.forBonus = await Utils.calculateFortitude(msg.author.id);

	let monsterStats = await getMonsterStats(monsterID);
	
    // Monster stuff
	if(random) {
		let eliteChance = Utils.randomIntIn(1,100);
		let elite = false;
		if(eliteChance <= 10) elite = true;
		monsterStats = await randomEnemyStats(monsterID, elite);
		battle.opponent.name = await getMonsterName(monsterID);
		battle.opponent.hp = monsterStats[5];
		battle.opponent.mp = monsterStats[6];
		battle.opponent.prBonus = monsterStats[0];
		battle.opponent.forBonus = monsterStats[1];
		battle.opponent.agiBonus = monsterStats[2];
		battle.opponent.impBonus = monsterStats[3];
		battle.opponent.preBonus = monsterStats[4];
	} else {
		battle.opponent.hp = await getMonsterHP(monsterID);
		battle.opponent.mp = await getMonsterMP(monsterID);
		battle.opponent.name = await getMonsterName(monsterID);
		battle.opponent.prBonus = await monsterBonus(monsterStats[0]);
		battle.opponent.forBonus = await monsterBonus(monsterStats[1]);
		battle.opponent.agiBonus = await monsterBonus(monsterStats[2]);
		battle.opponent.impBonus = await monsterBonus(monsterStats[3]);
		battle.opponent.preBonus = await monsterBonus(monsterStats[4]);
	}
		
	console.log(monsterStats);
		
	await msg.embed(Utils.makeRPGEmbed("Battle!", "<@"+msg.author.id+"> encountered a **"+battle.opponent.name+"**!"));

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
            if (random <= Math.floor(battle.attacker.preBonus / 2))
                multiplier = 2;

            random = Utils.randomIntIn(1, 100);
            if (random <= Math.floor(battle.attacker.impBonus / 1.5))
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
        } else if (choice === 'magic' && battle.attacker.canMagic) {
            const miss = Math.floor(Math.random() * 3);
            if (miss) {
                await msg.say(`${battle.attacker.name}'s magic missile missed!`);
            } else {
                const damage = Utils.randomIntIn(battle.defender.guard ? 10 : 50, battle.defender.guard ? 50 : 100);
                await msg.say(`${battle.attacker.name} deals **${damage}** magic damage!`);
                battle.defender.dealDamage(damage);
            }
            battle.attacker.useMP(50);
            battle.reset();
        } else if (choice === 'heal' && battle.attacker.canHeal) {
            const amount = Math.round(battle.attacker.mp);
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
    if (winner == battle.opponent.name) {
        msg.embed(Utils.makeRPGEmbed("You Lost!", "<@" + msg.author.id + "> was defeated by the **" + battle.opponent.name + "**. After some time unconscious, you wake up back in Dragonstone Village..."));
        await Utils.queryDB("UPDATE users SET location='[0,0]' WHERE discordID=" + msg.author.id);
    } else {
		let drops = await randomDrops(msg.author, monsterID, 1, 3);
        msg.embed(Utils.makeRPGEmbed("You Won!", "<@" + msg.author.id + "> defeated the **" + battle.opponent.name + "**!\n\n***Drops:***\n"+drops));
    }
}

// --
// Export functions
// --

module.exports = {
    battle,
    getMonsterName,
    randomDrop
};