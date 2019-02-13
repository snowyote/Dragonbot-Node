const Utils = require("./utils.js");
const {
    MonsterBattle
} = require('../structures/battle/monsterBattle.js');
const { PerformanceObserver, performance } = require('perf_hooks');

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

async function monsterBonus(skill, half=false) {
    let skillMultiplier = 5;
	if(half) skillMultiplier = 2.5;
	calculated = 0;
	for(let i = 1; i <= skill; i++) {
		if(i > 10) {
			if(!half) skillMultiplier = 2.5;
			else skillMultiplier = 1.25;
		}
		if(i > 20) {
			if(!half) skillMultiplier = 1.25;
			else skillMultiplier = 0.75;
		}
		calculated += skillMultiplier;
	}
    return calculated;
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
			if(drop.indexOf('-') > -1)
				return dropArray = drop.split('-');
			return drop;
        }
    } else {
		return ["none","0"];
	}
}

async function randomBossDrop(user, bossID) {
    let dropChance = Utils.randomIntIn(1, 100);
    let monRes = await Utils.queryDB("SELECT * FROM monsters_bosses WHERE id=" + bossID);
    let dropList = JSON.parse(monRes[0].drops);
    let dropRate = monRes[0].dropRate;
    if (dropChance <= dropRate) {
        if (dropList.length > 0) {
            let randomDrop = Utils.randomIntEx(0, dropList.length);
			let drop = dropList[randomDrop];
			if(drop.indexOf('-') > -1)
				return dropArray = drop.split('-');
			return drop;
        }
    } else {
		return ["none","0"];
	}
}

async function randomDrops(user, monsterID, min, max, isBoss=false) {
    let dropNum = Utils.randomIntIn(min, max);
    let questItems = new Array;
    let normalItems = new Array;
	let materials = new Array;
    let coins = 0;
    let food = 0;
    let orbs = 0;
    let keys = 0;
    let artifacts = 0;
    let logs = [0, 0, 0, 0, 0];
    let gems = [0, 0, 0, 0, 0];
    let crate = [0, 0, 0, 0, 0];
	let locationLevel = await Utils.getLocLevel(user);
    for (let i = 0; i < dropNum; i++) {
        let dropArray = await randomDrop(user, monsterID);
		if(isBoss) dropArray = await randomBossDrop(user, monsterID);
		
		let dropType = dropArray;
		let typeID = 0;
		
		if(Array.isArray(dropArray)) {
			if(dropArray.length == 2) {
				dropType = dropArray[0];
				typeID = parseInt(dropArray[1]);
			}
		}
		
        // Is quest item
        if (dropType == "quest") {
            if (await Utils.hasQuestItem(user.id, typeID) == false && !questItems.includes(typeID))
                questItems.push(typeID);
            // Is normal item
        } else if (dropType == "item") {
            if (await Utils.hasItem(user.id, typeID) == false && !normalItems.includes(typeID))
                normalItems.push(typeID);
            // Is material
        } else if (dropType == "material") {
                materials.push(typeID);
            // Is coins
        } else if (dropType == "coins") {
			let avarice = await Utils.avariceBonus(user.id);
            let randomCoins = Math.floor((Utils.randomIntIn(25,100)*((avarice+1)/10))*locationLevel);
			coins += randomCoins;
            // Is mystic orb
        } else if (dropType == "orbs") {
            let randomOrbs = Math.floor(Utils.randomIntIn(1*locationLevel,2*locationLevel));
            orbs += randomOrbs;
            // Is key
        } else if (dropType == "keys") {
            let randomKeys = Math.floor(Utils.randomIntIn(1*locationLevel,2*locationLevel));
            keys += randomKeys;
            // Is artifact
        } else if (dropType == "artifacts") {
            let randomArt = Math.floor(Utils.randomIntIn(1*locationLevel,2*locationLevel));
            artifacts += randomArt;
            // Is log
        } else if (dropType == "logs") {
            let randomLogs = Math.floor(Utils.randomIntIn(1*locationLevel,3*locationLevel));
            logs[typeID] += randomLogs;
            // Is gem
        } else if (dropType == "gems") {
            let randomGems = Math.floor(Utils.randomIntIn(1*locationLevel,3*locationLevel));
            gems[typeID] += randomGems;
            // Is crate
        } else if (dropType == "crates") {
            let randomCrate = Math.floor(Utils.randomIntIn(1*locationLevel,2*locationLevel));
            crate[typeID] += randomCrate;
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

    if (materials.length > 0) {
        for (let i = 0; i < materials.length; i++) {
            dropStr = dropStr + await Utils.getMaterial(materials[i], true) + '\n';
            await Utils.addMaterial(user.id, materials[i], 1);
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

async function randomEnemyStats(user, monsterID, isElite=false, isUltraElite=false) {
	Utils.log('\x1b[45m%s\x1b[0m', 'DB: Generating monster stats with ID '+monsterID);
	let level = await Utils.getLocLevel(user);
	
	let rVitality = (Utils.randomIntIn(isElite ? 4 : 0, isElite ? 8 : 3)+level)*level;
	let rArcana = (Utils.randomIntIn(isElite ? 4 : 0, isElite ? 8: 3)+level)*level;
	
	let randomHealth = 25 + (rVitality*25);
	let randomMagic = Utils.randomIntIn(25,50);
	
	if(isElite) {
		randomHealth = Math.floor(randomHealth * 1.5);
		randomMagic = Math.floor(randomMagic * 1.5);
	}
	
	if(isUltraElite) {
		randomHealth = randomHealth * 2;
		randomMagic = randomMagic * 2;
	}
	
	let monsterName = await getMonsterName(monsterID);
	
	let multiplier = 1;
	if(isElite) {
		multiplier = 2;
		monsterStats[7] = 'Elite '+monsterName;
	}
	if(isUltraElite) {
		multiplier = 5;
		monsterStats[7] = 'Ultra Elite '+monsterName;
	}
	
	var monsterStats = [0,0,0,0,0,100,100,"Name",0];
	
	monsterStats[0] = ((Utils.randomIntIn(isElite ? 4 : 0, isElite ? 8 : 3)+level)*level)*multiplier;
	monsterStats[1] = ((Utils.randomIntIn(isElite ? 4 : 0, isElite ? 8 : 3)+level)*level)*multiplier;
	monsterStats[2] = ((Utils.randomIntIn(isElite ? 4 : 0, isElite ? 8 : 3)+level)*level)*multiplier;
	monsterStats[3] = ((Utils.randomIntIn(isElite ? 4 : 0, isElite ? 8 : 3)+level)*level)*multiplier;
	monsterStats[4] = ((Utils.randomIntIn(isElite ? 4 : 0, isElite ? 8 : 3)+level)*level)*multiplier;
	
	monsterStats[5] = randomHealth;
	monsterStats[6] = randomMagic*level;
	
	monsterStats[7] = monsterName;
	
	let yourLevel = await Utils.getLevel(user.id);
	let yourStatCount = 20+((yourLevel-1)*4);
	let statCount = monsterStats[0]+monsterStats[1]+monsterStats[2]+monsterStats[3]+monsterStats[4]+Math.floor(monsterStats[5]/25)+Math.floor(monsterStats[6]/25);
	let adjustedStatCount = statCount - yourStatCount;
	monsterStats[8] = ((statCount+(adjustedStatCount*2))*level)*multiplier;
	if(monsterStats[8] <= 0) monsterStats[8] = 1;
	return monsterStats;
}

async function bossStats(user, bossID) {
	let bossRes = await Utils.queryDB("SELECT * FROM monsters_bosses WHERE id="+bossID);
	let level = await Utils.getLocLevel(user);
	
	var monsterStats = [bossRes[0].prowess,bossRes[0].fortitude,bossRes[0].agility,bossRes[0].impact,bossRes[0].precise,bossRes[0].health,bossRes[0].magic,"[Boss] "+bossRes[0].name,0];
	
	let multiplier = 10;
	
	let yourLevel = await Utils.getLevel(user.id);
	let yourStatCount = 20+((yourLevel-1)*4);
	let statCount = monsterStats[0]+monsterStats[1]+monsterStats[2]+monsterStats[3]+monsterStats[4]+Math.floor(monsterStats[5]/25)+Math.floor(monsterStats[6]/25);
	let adjustedStatCount = statCount - yourStatCount;
	monsterStats[8] = ((statCount+(adjustedStatCount*2))*level)*multiplier;
	if(monsterStats[8] <= 0) monsterStats[8] = 1;
	return monsterStats;
}

async function battle(msg, monsterID, battleMap, random=false, tournament=false, isBoss=false) {
	let t0 = performance.now();
    if (battleMap.has(msg.channel.id)) return msg.reply('Only one battle may be occurring per channel.');
    if (await Utils.isInBattle(msg.author)) return msg.reply('You are already in a battle!');
    battleMap.set(msg.channel.id, new MonsterBattle(msg.author, monsterID));
    const battle = battleMap.get(msg.channel.id);
    await Utils.setInBattle(msg.author, 1);

    // User stuff
    battle.user.hp = await Utils.calculateHP(msg.author.id);
    battle.user.maxHP = await Utils.calculateHP(msg.author.id);
    battle.user.mp = await Utils.calculateMP(msg.author.id);
    battle.user.maxMP = await Utils.calculateMP(msg.author.id);

    battle.user.prBonus = Math.ceil(await Utils.calculateProwess(msg.author.id));
    battle.user.preBonus = Math.ceil(await Utils.calculatePrecision(msg.author.id));
    battle.user.impBonus = Math.ceil(await Utils.calculateImpact(msg.author.id));
    battle.user.agiBonus = Math.ceil(await Utils.calculateAgility(msg.author.id));
    battle.user.forBonus = Math.ceil(await Utils.calculateFortitude(msg.author.id));

	let monsterStats;
	if(isBoss) monsterStats = await bossStats(msg.author, monsterID);
	else monsterStats = await getMonsterStats(monsterID);
	
    // Monster stuff
	if(random) {
		let eliteChance = Utils.randomIntIn(1,100);
		let elite = false;
		let ultraElite = false;
		if(eliteChance <= 10) elite = true;
		if(eliteChance <= 1) ultraElite = true;
		if(tournament) elite = false;
		monsterStats = await randomEnemyStats(msg.author, monsterID, elite);
		battle.opponent.name = monsterStats[7];
		battle.opponent.hp = monsterStats[5];
		battle.opponent.maxHP = monsterStats[5];
		battle.opponent.mp = monsterStats[6];
		battle.opponent.maxMP = monsterStats[6];
		battle.opponent.prBonus = Math.ceil(await monsterBonus(monsterStats[0]));
		battle.opponent.forBonus = Math.ceil(await monsterBonus(monsterStats[1]));
		battle.opponent.agiBonus = Math.ceil(await monsterBonus(monsterStats[2]));
		battle.opponent.impBonus = Math.ceil(await monsterBonus(monsterStats[3], true));
		battle.opponent.preBonus = Math.ceil(await monsterBonus(monsterStats[4], true));
	} else if(isBoss) {
		battle.opponent.name = monsterStats[7];
		battle.opponent.hp = monsterStats[5];
		battle.opponent.maxHP = monsterStats[5];
		battle.opponent.mp = monsterStats[6];
		battle.opponent.maxMP = monsterStats[6];
		battle.opponent.prBonus = Math.ceil(await monsterBonus(monsterStats[0]));
		battle.opponent.forBonus = Math.ceil(await monsterBonus(monsterStats[1]));
		battle.opponent.agiBonus = Math.ceil(await monsterBonus(monsterStats[2]));
		battle.opponent.impBonus = Math.ceil(await monsterBonus(monsterStats[3], true));
		battle.opponent.preBonus = Math.ceil(await monsterBonus(monsterStats[4], true));
	} else {
		battle.opponent.hp = await getMonsterHP(monsterID);
		battle.opponent.maxHP = await getMonsterHP(monsterID);
		battle.opponent.mp = await getMonsterMP(monsterID);
		battle.opponent.maxMP = await getMonsterMP(monsterID);
		battle.opponent.name = await getMonsterName(monsterID);
		battle.opponent.prBonus = await monsterBonus(monsterStats[0]);
		battle.opponent.forBonus = await monsterBonus(monsterStats[1]);
		battle.opponent.agiBonus = await monsterBonus(monsterStats[2]);
		battle.opponent.impBonus = await monsterBonus(monsterStats[3]);
		battle.opponent.preBonus = await monsterBonus(monsterStats[4]);	
	}
	
	// Coin flip for who goes first
	
	let firstStrike = Utils.randomIntIn(1,100);
	if(firstStrike <= 50) battle.userTurn = true;
	else battle.userTurn = false;
		
	if(!tournament) msg.embed(Utils.makeRPGEmbed("Battle!", "<@"+msg.author.id+"> encountered **"+battle.opponent.name
	+"**!\n🗡️ Prowess: "+monsterStats[0]
	+"\n🛡️ Fortitude: "+monsterStats[1]
	+"\n👢 Agility: "+monsterStats[2]
	+"\n💥 Impact: "+monsterStats[3]
	+"\n🎯 Precision: "+monsterStats[4]));
	
    while (!battle.winner) {
        const choice = await battle.attacker.chooseAction(msg);
		let countered = 0;
			
		if(battle.defender.counter) {
			countered = 1;
			battle.defender.changeCounter();
		}

        if (choice === 'attack') {
            let multiplier = 1;
            let missed = 0;
            let stunned = 0;

            let random = Utils.randomIntIn(1, 100);
            if (random <= Math.floor(battle.defender.agiBonus-battle.attacker.agiBonus))
                missed = 1;

            random = Utils.randomIntIn(1, 100);
            if (random <= Math.floor(battle.attacker.preBonus))
                multiplier = 2;

            random = Utils.randomIntIn(1, 100);
            if (random <= Math.floor(battle.attacker.impBonus))
                if(!battle.defender.stunned) stunned = 1;

            let dmgMin = 10 + (Math.floor(battle.attacker.prBonus) - Math.floor(battle.defender.forBonus/3)) * multiplier;
            let dmgMinGuard = (5 + (Math.floor(battle.attacker.prBonus) - Math.floor(battle.defender.forBonus/3)) * multiplier) / 2;
            let dmgMax = 20 + (Math.floor(battle.attacker.prBonus) - Math.floor(battle.defender.forBonus/3)) * multiplier;
            let dmgMaxGuard = (10 + (Math.floor(battle.attacker.prBonus) - Math.floor(battle.defender.forBonus/3)) * multiplier) / 2;

            let damage = Utils.randomIntIn(battle.defender.guard ? dmgMinGuard : dmgMin, battle.defender.guard ? dmgMaxGuard : dmgMax);
			
			if(battle.attacker.focus) {
                await msg.say(`${battle.attacker.name} feels powerful!`);
				damage = damage*2;
				battle.attacker.changeFocus();
			}
            if (damage < 1) damage = 1;

            if (missed) {
                await msg.say(`${battle.attacker.name} missed!`);
                battle.reset();
            } else if (countered) {
                await msg.say(`${battle.defender.name} countered the attack, dealing **${damage}** damage!`);
                battle.attacker.dealDamage(damage);
                battle.reset();
            } else if (stunned) {
                await msg.say(`${battle.attacker.name} deals **${damage}** impact damage, causing ${battle.defender.name} to miss a turn!`);
                battle.defender.dealDamage(damage);
                battle.reset();
                battle.reset();
				battle.defender.stunned = true;
            } else {
                if (multiplier == 2) await msg.say(`${battle.attacker.name} ***critically hit***, dealing **${damage}** damage!`);
                else await msg.say(`${battle.attacker.name} deals **${damage}** damage!`);
                battle.defender.dealDamage(damage);
                battle.reset();
            }
        } else if (choice === 'fortify') {
            await msg.say(`${battle.attacker.name} is now fortifying to regain MP!`);
            battle.attacker.changeGuard();
            battle.reset(false);
        } else if (choice === 'focus') {
            await msg.say(`${battle.attacker.name} is now focusing their strength!`);
            battle.attacker.changeFocus();
            battle.reset(true,false);
        } else if (choice === 'counter') {
            await msg.say(`${battle.attacker.name} is watching their opponent's moves carefully!`);
            battle.attacker.changeCounter();
            battle.reset(true,false,false);
        } else if (choice === 'magic' && battle.attacker.canMagic) {
            const miss = Math.floor(Math.random() * 2);
            if (miss) {
                await msg.say(`${battle.attacker.name}'s magic missile missed!`);
            } else {
                let damage = Utils.randomIntIn(battle.defender.guard ? 10 : 50, battle.defender.guard ? 50 : 100);
				if(countered) damage = damage*2;
                await msg.say(`${battle.attacker.name} deals **${damage}** magic damage!`);
                battle.defender.dealDamage(damage);
            }
            battle.attacker.useMP(50);
            battle.reset();
        } else if (choice === 'heal' && battle.attacker.canHeal) {
            let amount = battle.attacker.maxHP - battle.attacker.hp;
			if(amount >= battle.attacker.mp) amount = battle.attacker.mp;
            await msg.say(`${battle.attacker.name} heals **${amount}** HP!`);
            battle.attacker.heal(amount);
            battle.attacker.useMP(amount);
            battle.reset();
        } else if (choice === 'run') {
			if(!isBoss) {
			let runChance = Utils.randomIntIn(1,100);
				if(runChance <= 33) {
					battle.attacker.forfeit();
				} else {
					await msg.say(`${battle.attacker.name} was unable to flee!`);
					battle.reset();
				}
			} else {
				await msg.say(`You cannot run from this fight.`);
			}
        } else if (choice === 'failed:time') {
            await msg.say(`Time's up, ${battle.attacker.name}!`);
            battle.reset();
        } else {
            await msg.say('You cannot do that!');
        }
		let t1 = performance.now();
    }
    const {
        winner
    } = battle;
    await Utils.setInBattle(msg.author, 0);
    battleMap.delete(msg.channel.id);
    if (winner == battle.opponent.name) {
		if(!tournament) {
			if(battle.user.hasForfeit) {
				msg.embed(Utils.makeRPGEmbed("You Ran Away!", "<@" + msg.author.id + "> ran away from the **" + battle.opponent.name + "**!"));
			}
			else {
				msg.embed(Utils.makeRPGEmbed("You Lost!", "<@" + msg.author.id + "> was defeated by the **" + battle.opponent.name + "**. After some time unconscious, you wake up back in the encampment..."));
				await Utils.deathXP(msg, msg.author.id);
				await Utils.queryDB("UPDATE users SET location='[0,0]', inDungeon=0 WHERE discordID=" + msg.author.id);
			}
		}
		return false;
    } else {
		if(!tournament) {
			if(battle.opponent.hasForfeit) {
				msg.embed(Utils.makeRPGEmbed("Enemy Ran!", battle.opponent.name+" ran away from the battle!"));
			} 
			else {
				let drops = await randomDrops(msg.author, monsterID, 1, 3, false);
				if(isBoss) drops = await randomDrops(msg.author, monsterID, 1, 3, true);
				msg.embed(Utils.makeRPGEmbed("You Won!", "<@" + msg.author.id + "> defeated the **" + battle.opponent.name + "**!\n\n***Drops:***\n"+drops));
				await Utils.giveXP(msg, msg.author.id, monsterStats[8]);
			}
		} else {
			await Utils.addAchProgress(msg.author.id, 'battlesWon', 1);
			return monsterStats[8];
		}
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