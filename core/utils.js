const mysql = require('promise-mysql');
const Jimp = require('jimp');
const Discord = require('discord.js');
const request = require('request-promise');
const configFile = require("../config.json");
const { PerformanceObserver, performance } = require('perf_hooks');

const config = {
    host: configFile.host,
    user: configFile.user,
    password: configFile.password,
    database: configFile.database,
    charset: configFile.charset
};

// --
// Query SQL database function
// --

async function queryDB(sql) {
    let connection;
    try {
        //log("\x1b[36m%s\x1b[0m", "DB: Running query: " + sql);
        connection = await mysql.createConnection(config);
        let result = await connection.query(sql);
        connection.end();
        return result;
    } catch (error) {
        log("\x1b[31m%s\x1b[0m", "Utils: Error in querying database\n" + error.stack);
    };
}

function makeRPGEmbed(fieldTitle, fieldValue) {
    const embedMsg = new Discord.RichEmbed()
        .setAuthor("World of the House of Dragons", "https://i.imgur.com/CyAb3mV.png")
        .addField(fieldTitle, fieldValue);

    return embedMsg;
}

function makeBJEmbed(fieldTitle, fieldValue, field2Title=false, field2Value=false, field3Title=false, field3Value=false) {
    const embedMsg = new Discord.RichEmbed()
        .setAuthor("Casino Island Blackjack", "https://i.imgur.com/CyAb3mV.png")
        .addField(fieldTitle, fieldValue);
		
    if(field2Title !== false) embedMsg.addField(field2Title, field2Value);
    if(field3Title !== false) embedMsg.addField(field3Title, field3Value);

    return embedMsg;
}

async function takeCoins(userID, coins) {
    await queryDB("UPDATE users SET coins=coins-" + coins + " WHERE discordID=" + userID);
    log("\x1b[32m%s\x1b[0m", "Utils: Took " + coins + " coins from " + userID);
}

async function giveCoins(userID, coins) {
    await queryDB("UPDATE users SET coins=coins+" + coins + " WHERE discordID=" + userID);
    log("\x1b[32m%s\x1b[0m", "Utils: Gave " + coins + " coins to " + userID);
}

async function addTrash(userID, trash) {
    await queryDB("UPDATE users SET trash=trash+" + trash + " WHERE discordID=" + userID);
    log("\x1b[32m%s\x1b[0m", "Utils: Gave " + trash + " trash to " + userID);
}

async function takeChips(userID, chips) {
    await queryDB("UPDATE users SET casinoChips=casinoChips-" + chips + " WHERE discordID=" + userID);
    log("\x1b[32m%s\x1b[0m", "Utils: Took " + chips + " casino chips from " + userID);
}

async function hasChips(userID, chips) {
    let userRes = await queryDB("SELECT casinoChips FROM users WHERE discordID=" + userID);
	if(userRes[0].casinoChips >= chips) return true;
	else return false;
}

async function giveChips(userID, chips) {
    await queryDB("UPDATE users SET casinoChips=casinoChips+" + chips + " WHERE discordID=" + userID);
    log("\x1b[32m%s\x1b[0m", "Utils: Gave " + chips + " casino chips to " + userID);
}

function log(colour, string) {
    if (configFile.log) console.log(colour, string);
}

async function getMonsterHP(monsterID) {
    const monsterRes = await queryDB("SELECT health FROM monsters WHERE id=" + monsterID);
    return monsterRes[0].health;
}

async function getMonsterStats(monsterID) {
    const monsterRes = await queryDB("SELECT * FROM monsters WHERE id=" + monsterID);
    let monsterStats = new Array();
    monsterStats.push(monsterRes[0].prowess, monsterRes[0].fortitude, monsterRes[0].agility, monsterRes[0].impact, monsterRes[0].precise);
    return monsterStats;
}

// --
// Stat functions
//

async function calculateHP(userID) {
    const skillMultiplier = 25;
    const userRes = await queryDB("SELECT vitality, vitalityBonus FROM users WHERE discordID=" + userID);
    let vitality = userRes[0].vitality + userRes[0].vitalityBonus;
    let baseVitality = 100;
    return baseVitality + (vitality * skillMultiplier);
}

async function calculateMP(userID) {
    const skillMultiplier = 25;
    const userRes = await queryDB("SELECT arcana, arcanaBonus FROM users WHERE discordID=" + userID);
    let arcana = userRes[0].arcana + userRes[0].arcanaBonus;
    let baseArcana = 100;
    return baseArcana + (arcana * skillMultiplier);
}

async function calculateProwess(userID) {
    let skillMultiplier = 5;
    const userRes = await queryDB("SELECT prowess, prowessBonus FROM users WHERE discordID=" + userID);
    let prowess = 0;
	let calculated = 0;
    if (userRes && userRes.length) {
		prowess = userRes[0].prowess + userRes[0].prowessBonus;
		for(let i = 1; i <= prowess; i++) {
			if(i > 10) skillMultiplier = 2.5;
			if(i > 20) skillMultiplier = 1.25;
			calculated += skillMultiplier
		}
	}
    return calculated;
}

async function calculateFortitude(userID) {
    let skillMultiplier = 5;
    const userRes = await queryDB("SELECT fortitude, fortitudeBonus FROM users WHERE discordID=" + userID);
    let fortitude = 0;
	let calculated = 0;
    if (userRes && userRes.length) {
		fortitude = userRes[0].fortitude + userRes[0].fortitudeBonus;
		for(let i = 1; i <= fortitude; i++) {
			if(i > 10) skillMultiplier = 2.5;
			if(i > 20) skillMultiplier = 1.25;
			calculated += skillMultiplier
		}
	}
    return calculated;
}

async function calculatePrecision(userID) {
    let skillMultiplier = 2.5;
    const userRes = await queryDB("SELECT precise, precisionBonus FROM users WHERE discordID=" + userID);
    let precise = 0;
	let calculated = 0;
    if (userRes && userRes.length) {
		precise = userRes[0].precise + userRes[0].precisionBonus;
		for(let i = 1; i <= precise; i++) {
			if(i > 10) skillMultiplier = 1.25;
			if(i > 20) skillMultiplier = 0.75;
			calculated += skillMultiplier
		}
	}
    return calculated;
}

async function calculateAgility(userID) {
    let skillMultiplier = 5;
    const userRes = await queryDB("SELECT agility, agilityBonus FROM users WHERE discordID=" + userID);
    let agility = 0;
	let calculated = 0;
    if (userRes && userRes.length) {
		agility = userRes[0].agility + userRes[0].agilityBonus;
		for(let i = 1; i <= agility; i++) {
			if(i > 10) skillMultiplier = 2.5;
			if(i > 20) skillMultiplier = 1.25;
			calculated += skillMultiplier
		}
	}
    return calculated;
}

async function calculateImpact(userID) {
    let skillMultiplier = 2.5;
    const userRes = await queryDB("SELECT impact, impactBonus FROM users WHERE discordID=" + userID);
    let impact = 0;
	let calculated = 0;
    if (userRes && userRes.length) {
		impact = userRes[0].impact + userRes[0].impactBonus;
		for(let i = 1; i <= impact; i++) {
			if(i > 10) skillMultiplier = 1.25;
			if(i > 20) skillMultiplier = 0.75;
			calculated += skillMultiplier
		}
	}
    return calculated;
}

// --
// Check if string is a positive integer
// --

function isNormalInteger(str) {
    var n = Math.floor(Number(str));
    return n !== Infinity && String(n) === str && n > 0;
}

function getTimestamp() {
    return new Date().getTime();
}

async function hasItem(userID, item) {
    const userRes = await queryDB("SELECT equipmentList FROM users WHERE discordID=" + userID);
    let itemList = JSON.parse(userRes[0].equipmentList);
    if (itemList.includes(item)) return true;
    else return false;
}

async function removeItem(userID, item) {
    const userRes = await queryDB("SELECT equipmentList FROM users WHERE discordID=" + userID);
    let itemList = JSON.parse(userRes[0].equipmentList);
    let newItems = new Array();
    if (itemList.includes(item)) {
        for (var i = 0; i < itemList.length; i++) {
            if (itemList[i] !== item) {
                newItems.push(itemList[i]);
            } else log("DB: Removed item ID " + item);
        }
        await queryDB("UPDATE users SET equipmentList='" + JSON.stringify(newItems) + "' WHERE discordID=" + userID);
        return true;
    } else return false;
}

async function avariceBonus(userID) {
    let queryRes = await queryDB("SELECT * FROM users WHERE discordID=" + userID);
    var userID = queryRes[0].id;
    var active = queryRes[0].activePet;
    if (active > 0) {
        let petRes = await queryDB("SELECT * FROM pets WHERE id=" + active);
        var avarice = petRes[0].avarice + petRes[0].avariceBoost;
        return avarice;
    } else
        return 1;
}

async function addItem(userID, item) {
    const userRes = await queryDB("SELECT equipmentList FROM users WHERE discordID=" + userID);
    let itemList = JSON.parse(userRes[0].equipmentList);
    if (itemList.includes(item)) return false;
    else {
        itemList.push(item);
        await queryDB("UPDATE users SET equipmentList='" + JSON.stringify(itemList) + "' WHERE discordID=" + userID);
        log("\x1b[32m%s\x1b[0m", `Utils: Added item ID ${item} to ${userID}`);
        return true;
    }
}

async function hasQuestItem(userID, item) {
    const userRes = await queryDB("SELECT questItems FROM users WHERE discordID=" + userID);
    let itemList = JSON.parse(userRes[0].questItems);
    if (itemList.includes(item)) return true;
    else return false;
}

async function hasMaterial(userID, item, amount = 0) {
    const userRes = await queryDB("SELECT materials FROM users WHERE discordID=" + userID);
    let materials = JSON.parse(userRes[0].materials);
    if (materials[item]) return materials[item];
    else return false;
}

async function getItem(item, description) {
    const itemRes = await queryDB("SELECT * from items WHERE id=" + item);
    if (description) return itemRes[0].name + ' (*' + itemRes[0].description + '*)';
    else return itemRes[0].name;
}

async function getMaterial(item, description) {
    const itemRes = await queryDB("SELECT * from materials WHERE id=" + item);
    if (description) return itemRes[0].name + ' (*' + itemRes[0].description + '*)';
    else return itemRes[0].name;
}

async function getQuestItem(item, description) {
    const itemRes = await queryDB("SELECT * from quest_items WHERE id=" + item);
    if (description) return itemRes[0].name + ' (*' + itemRes[0].description + '*)';
    else return itemRes[0].name;
}

async function getQuestsCompleted(userID) {
    let dbUserID = await getUserID(userID, true);
    const questRes = await queryDB("SELECT quests_completed FROM rpg_flags WHERE userID=" + dbUserID);
    let completedList = JSON.parse(questRes[0].quests_completed);
    return completedList;
}

async function getTilesActivated(userID) {
    let dbUserID = await getUserID(userID, true);
    const questRes = await queryDB("SELECT tiles_activated FROM rpg_flags WHERE userID=" + dbUserID);
    let tilesActivated = JSON.parse(questRes[0].tiles_activated);
    return tilesActivated;
}

async function hasActivatedTile(userID, tileID) {
    let tilesList = await getTilesActivated(userID);
    if (tilesList.includes(tileID)) return true;
    else return false;
}

async function activateTile(user, tileID) {
	if(await hasActivatedTile(user.id, tileID)) return false;
	
    let dbUserID = await getUserID(user.id, true);
	
	let tilesList = await getTilesActivated(user.id);
	tilesList.push(tileID);
	await queryDB("UPDATE rpg_flags SET tiles_activated='"+JSON.stringify(tilesList)+"' WHERE userID="+dbUserID);
}

async function getTileID(user) {
	let location, query;
	if(await isInDungeon(user.id)) {
		location = await getDungeonLocation(user);
		query = await queryDB("SELECT * FROM locations_dungeon WHERE coords='"+JSON.stringify(location)+"'");
		return query[0].id;
	} else {
		location = await getLocation(user);
		query = await queryDB("SELECT * FROM locations WHERE coords='"+JSON.stringify(location)+"'");
		return query[0].id;
	}
}

async function hasCompletedQuest(userID, quest) {
    let completedList = await getQuestsCompleted(userID);
    if (completedList.includes(quest)) return true;
    else return false;
}

async function completeQuest(userID, quest) {
    const questRes = await queryDB("SELECT * FROM quests WHERE id=" + quest);

    let description = questRes[0].description;
    let questFlag = questRes[0].questFlag;
    let name = questRes[0].name;

    let reward = questRes[0].reward;

    // This can be the ID if it's an item, or amount if it's a resource!
    let rewardAmount = questRes[0].rewardAmount;

	// Take needed items
    let itemType = questRes[0].itemType;
    let typeID = questRes[0].typeID;
    let itemAmount = questRes[0].amountNeeded;

	switch(itemType) {
		case 'quest':
			await removeQuestItem(userID, typeID);
			break;
		case 'material':
			await takeMaterial(userID, typeID, itemAmount);
			break;
	}
    
    let rewardStr = "";

    switch (reward) {
        case 'quest_item':
            await addQuestItem(userID, rewardAmount);
            rewardStr = rewardStr + await getQuestItem(rewardAmount, true);
            break;
        case 'coins':
            await giveCoins(userID, rewardAmount);
            rewardStr = rewardStr + '**' + rewardAmount + '** coins';
            break;
        case 'item':
            await addItem(userID, rewardAmount);
            rewardStr = rewardStr + await getItem(rewardAmount, true);
            break;
    }

    let dbUserID = await getUserID(userID, true);

    let completedList = await getQuestsCompleted(userID, quest);
    completedList.push(quest);

    await queryDB("UPDATE rpg_flags SET quest_in_progress=0, " + questFlag + "=" + questFlag + "+1, quests_completed='" + JSON.stringify(completedList) + "' WHERE userID=" + dbUserID);

    const questMsg = makeRPGEmbed("Completed Quest: " + name, '*' + description + '*\n\n**Reward:** ' + rewardStr);
    return questMsg;
}

async function removeQuestItem(userID, item) {
    const userRes = await queryDB("SELECT questItems FROM users WHERE discordID=" + userID);
    let itemList = JSON.parse(userRes[0].questItems);
    let newItems = new Array();
    if (itemList.includes(item)) {
        for (var i = 0; i < itemList.length; i++) {
            if (itemList[i] !== item) {
                newItems.push(itemList[i]);
            } else log("\x1b[32m%s\x1b[0m", `Utils: Removed quest item ID ${item} from ${userID}`);
        }
        await queryDB("UPDATE users SET questItems='" + JSON.stringify(newItems) + "' WHERE discordID=" + userID);
        return true;
    } else return false;
}

async function addQuestItem(userID, item) {
    const userRes = await queryDB("SELECT questItems FROM users WHERE discordID=" + userID);
    let itemList = JSON.parse(userRes[0].questItems);
    if (itemList.includes(item)) return false;
    else {
        itemList.push(item);
        await queryDB("UPDATE users SET questItems='" + JSON.stringify(itemList) + "' WHERE discordID=" + userID);
        log("\x1b[32m%s\x1b[0m", `Utils: Added quest item ID ${item} to ${userID}`);
        return true;
    }
}

async function addMaterial(userID, material, amount) {
    const userRes = await queryDB("SELECT materials FROM users WHERE discordID=" + userID);
    const matRes = await queryDB("SELECT * FROM materials WHERE id=" + material);
    let materialList = JSON.parse(userRes[0].materials);
    let mat = material.toString();
    if (materialList[mat]) {
        // contains material already
        materialList[mat] += amount;
    } else {
        // does not contain material already
        materialList[mat] = amount;
    }
    await queryDB("UPDATE users SET materials='" + JSON.stringify(materialList) + "' WHERE discordID=" + userID);
}

async function takeMaterial(userID, material, amount) {
    const userRes = await queryDB("SELECT materials FROM users WHERE discordID=" + userID);
    const matRes = await queryDB("SELECT * FROM materials WHERE id=" + material);
    let materialList = JSON.parse(userRes[0].materials);
    let mat = material.toString();
    if (materialList[mat]) {
        // contains material already
        materialList[mat] -= amount;
		if(materialList[mat] <= 0) {
			let index = materialList.indexOf(mat);
			materialList.splice(index, 1);
		}
    }
	
    await queryDB("UPDATE users SET materials='" + JSON.stringify(materialList) + "' WHERE discordID=" + userID);
}

async function addOrbs(userID, amount) {
    await queryDB("UPDATE users SET mysticOrbs=mysticOrbs+" + amount + " WHERE discordID=" + userID);
}

async function addKeys(userID, amount) {
    await queryDB("UPDATE users SET crateKeys=crateKeys+" + amount + " WHERE discordID=" + userID);
}

async function addFood(userID, amount) {
    await queryDB("UPDATE users SET food=food+" + amount + " WHERE discordID=" + userID);
}

async function addArtifacts(userID, amount) {
    await queryDB("UPDATE users SET artifacts=artifacts+" + amount + " WHERE discordID=" + userID);
}

async function addLogs(userID, logID, amount) {
    const userRes = await queryDB("SELECT logs FROM users WHERE discordID=" + userID);
    let logList = JSON.parse(userRes[0].logs);
    logList[logID] += amount;
    await queryDB("UPDATE users SET logs='" + JSON.stringify(logList) + "' WHERE discordID=" + userID);
	log("\x1b[32m%s\x1b[0m", `Utils: Added ${amount} logs of ID ${logID} to ${userID}`);
}

async function getLogType(logID) {
    let logRes = await queryDB("SELECT name, icon FROM log_types WHERE id=" + (logID+1));
    return logRes[0].name;
}

async function getCrateType(crateID) {
    let crateRes = await queryDB("SELECT name FROM crate_types WHERE id=" + (crateID+1));
    return crateRes[0].name;
}

async function getGemType(gemID) {
    let gemRes = await queryDB("SELECT name FROM gem_types WHERE id=" + (gemID+1));
    return gemRes[0].name;
}

async function addGems(userID, gemID, amount) {
    const userRes = await queryDB("SELECT gems FROM users WHERE discordID=" + userID);
    let gemList = JSON.parse(userRes[0].gems);
    gemList[gemID] += amount;
    await queryDB("UPDATE users SET gems='" + JSON.stringify(gemList) + "' WHERE discordID=" + userID);
	log("\x1b[32m%s\x1b[0m", `Utils: Added ${amount} gems of ID ${gemID} to ${userID}`);
}

async function addCrate(userID, crateID, amount) {
    const userRes = await queryDB("SELECT crate FROM users WHERE discordID=" + userID);
    let crateList = JSON.parse(userRes[0].crate);
    crateList[crateID] += amount;
    await queryDB("UPDATE users SET crate='" + JSON.stringify(crateList) + "' WHERE discordID=" + userID);
	log("\x1b[32m%s\x1b[0m", `Utils: Added ${amount} crates of ID ${crateID} to ${userID}`);
}

// --
// Check if string is numeric
// --

function isNumeric(num) {
    return !isNaN(num)
}

function shuffle(array) {
		const arr = array.slice(0);
		for (let i = arr.length - 1; i >= 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			const temp = arr[i];
			arr[i] = arr[j];
			arr[j] = temp;
		}
		return arr;
}

async function RPGOptions(user) {
    let actions;
	let inDungeon = await isInDungeon(user.id);
	if(inDungeon) actions = await getDungeonActions(user);
	else {
		const locationType = await getLocType(user);
		const locActions = await getLocActions(user);
		const typeActions = await getLocTypeActions(locationType);
		actions = locActions.concat(typeActions);
	}
	
	
    //log(actions);
    var opt = "";
    if (actions.includes('market')) opt = opt + '**Market** (*!market*)\n';
    if (actions.includes('explore')) opt = opt + '**Explore** (*!explore*)\n';
    if (actions.includes('talk')) opt = opt + '**Talk** (*!talk*)\n';
    if (actions.includes('rest')) opt = opt + '**Rest** (*!rest*)\n';
    if (actions.includes('fish')) opt = opt + '**Fish** (*!fish*)\n';
    if (actions.includes('chop')) opt = opt + '**Chop Trees** (*!chop*)\n';
    if (actions.includes('mine')) opt = opt + '**Mine** (*!mine*)\n';
    if (actions.includes('activate')) opt = opt + '**Waypoint** (*!activate*)\n';
    if (actions.includes('tournament')) opt = opt + '**Tournament** (*!tournament*)\n';
    if (actions.includes('mysticism')) opt = opt + '**Mysticism** (*!mysticism*)\n';
    if (actions.includes('slots')) opt = opt + '**Slot Machine** (*!slots*)\n';
    if (actions.includes('blackjack')) opt = opt + '**Blackjack** (*!blackjack*)\n';
    if (actions.includes('chips')) opt = opt + '**Buy/Sell Chips** (*!chips*)\n';
    if (actions.includes('battle')) opt = opt + '**Battle** (*!battle*)\n';
    if (actions.includes('enter')) opt = opt + '**Enter Dungeon** (*!enter*)\n';
    if (actions.includes('exit')) opt = opt + '**Exit Dungeon** (*!exit*)\n';
    if (actions.includes('descend')) opt = opt + '**Descend Stairs** (*!descend*)\n';
    if (actions.includes('ascend')) opt = opt + '**Ascend Stairs** (*!ascend*)\n';
    if (actions.includes('search')) opt = opt + '**Search** (*!search*)\n';
    if (actions.includes('touch')) opt = opt + '**Touch** (*!touch*)\n';
    if (actions.includes('fly')) opt = opt + '**Fly on Airship** (*!fly*)\n';
    if (actions.includes('sail')) opt = opt + '**Sail on Boat** (*!sail*)\n';

    opt = opt.slice(0, -1);
	
	if(opt.length < 1) opt = "No Actions";
    return opt;
}

async function randomDungeonLoot(user, loot) {
    if (loot.length > 0) {
		let randomDrop = randomIntEx(0, loot.length);
		let drop = loot[randomDrop];
		if(drop.indexOf('-') > -1) {
			return dropArray = drop.split('-');
			return drop;
		} else {
			return ["none","0"];
		}
	}
}

async function searchRewards(user) {
	let dungeonName = await getDungeon(user);
	let dungeonRes = await queryDB("SELECT * FROM location_dungeons WHERE name='"+dungeonName+"'")
    let dropNum = randomIntIn(dungeonRes[0].loot_min, dungeonRes[0].loot_max);
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
	let locationLevel = await getLocLevel(user);
    for (let i = 0; i < dropNum; i++) {
		let dungeonLoot = await getDungeonLoot(user);
        let dropArray = await randomDungeonLoot(user, dungeonLoot);
		
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
            if (await hasQuestItem(user.id, typeID) == false && !questItems.includes(typeID))
                questItems.push(typeID);
            // Is normal item
        } else if (dropType == "item") {
            if (await hasItem(user.id, typeID) == false && !normalItems.includes(typeID))
                normalItems.push(typeID);
            // Is material
        } else if (dropType == "material") {
                materials.push(typeID);
            // Is coins
        } else if (dropType == "coins") {
			let avarice = await avariceBonus(user.id);
            let randomCoins = Math.floor((randomIntIn(25,100)*((avarice+1)/10))*locationLevel);
			coins += randomCoins;
            // Is mystic orb
        } else if (dropType == "orbs") {
            let randomOrbs = Math.floor(randomIntIn(1*locationLevel,2*locationLevel));
            orbs += randomOrbs;
            // Is key
        } else if (dropType == "keys") {
            let randomKeys = Math.floor(randomIntIn(1*locationLevel,2*locationLevel));
            keys += randomKeys;
            // Is artifact
        } else if (dropType == "artifacts") {
            let randomArt = Math.floor(randomIntIn(1*locationLevel,2*locationLevel));
            artifacts += randomArt;
            // Is log
        } else if (dropType == "logs") {
            let randomLogs = Math.floor(randomIntIn(1*locationLevel,3*locationLevel));
            logs[typeID] += randomLogs;
            // Is gem
        } else if (dropType == "gems") {
            let randomGems = Math.floor(randomIntIn(1*locationLevel,3*locationLevel));
            gems[typeID] += randomGems;
            // Is crate
        } else if (dropType == "crates") {
            let randomCrate = Math.floor(randomIntIn(1*locationLevel,2*locationLevel));
            crate[typeID] += randomCrate;
        }
    }

    // Make the strings and give the things
    let dropStr = "";

    if (normalItems.length > 0) {
        for (let i = 0; i < normalItems.length; i++) {
            dropStr = dropStr + await getItem(normalItems[i], true) + '\n';
            await addItem(user.id, normalItems[i]);
        }
    }

    if (questItems.length > 0) {
        for (let i = 0; i < questItems.length; i++) {
            dropStr = dropStr + await getQuestItem(questItems[i], true) + '\n';
            await addQuestItem(user.id, questItems[i]);
        }
    }

    if (materials.length > 0) {
        for (let i = 0; i < materials.length; i++) {
            dropStr = dropStr + await getMaterial(materials[i], true) + '\n';
            await addMaterial(user.id, materials[i], 1);
        }
    }

    if (coins > 0) {
        dropStr = dropStr + '**' + coins + '** coins\n';
        await giveCoins(user.id, coins);
    }

    if (food > 0) {
        dropStr = dropStr + '**' + food + '** food\n';
        await addFood(user.id, food);
    }

    if (orbs > 0) {
        dropStr = dropStr + '**' + orbs + '** mystic orbs\n';
        await addOrbs(user.id, orbs);
    }

    if (keys > 0) {
        dropStr = dropStr + '**' + keys + '** crate keys\n';
        await addKeys(user.id, keys);
    }
	
    if (artifacts > 0) {
        dropStr = dropStr + '**' + artifacts + '** ancient artifacts\n';
        await addArtifacts(user.id, artifacts);
    }

    for (let i = 0; i < 5; i++) {
        let type = '';
        if (logs[i] > 0) {
            type = await getLogType(i);
            dropStr = dropStr + '**' + logs[i] + '** ' + type.toLowerCase() + ' log(s)\n';
            await addLogs(user.id, i, logs[i]);
        }
        if (gems[i] > 0) {
            type = await getGemType(i);
            dropStr = dropStr + '**' + gems[i] + '** ' + type.toLowerCase() + '(s) \n';
            await addGems(user.id, i, gems[i]);
        }
        if (crate[i] > 0) {
            type = await getCrateType(i);
            dropStr = dropStr + '**' + crate[i] + '** ' + type.toLowerCase() + '(s) \n';
            await addCrate(user.id, i, crate[i]);
        }
    }
	
	if(dropStr.length > 0) {
		dropStr = dropStr.slice(0,-1);
		return dropStr;
	} else {
		return "Nothing!";
	}
}

async function getLocation(user) {
    const locations = await queryDB("SELECT location FROM users WHERE discordID=" + user.id);
    return JSON.parse(locations[0].location);
}

async function getLocID(user) {
    const locations = await getLocation(user);
    const locationRes = await queryDB("SELECT id FROM locations WHERE coords='" + JSON.stringify(locations) + "'");
    let id = locationRes[0].id;
    return id;
}

async function getLocCoords(locationID) {
    const locationRes = await queryDB("SELECT coords FROM locations WHERE id="+locationID);
    let coords = JSON.parse(locationRes[0].coords);
    return coords;
}

async function getLocNameByID(locationID) {
    const locationRes = await queryDB("SELECT name FROM locations WHERE id="+locationID);
    let name = locationRes[0].name;
    return name;
}

async function listWaypoints(userID) {
	let waypointList = await getWaypoints(userID);
	let listStr = "";
	for(let i = 0; i < waypointList.length; i++) {
		let currentName = await getLocNameByID(waypointList[i]);
		listStr = listStr + '['+waypointList[i]+']'+' '+currentName+'\n';
	}
	listStr = listStr.slice(0,-1);
	return listStr;
}

async function getWaypoints(userID) {
    let dbUserID = await getUserID(userID, true);
    const questRes = await queryDB("SELECT active_waypoints FROM rpg_flags WHERE userID=" + dbUserID);
    let waypointList = JSON.parse(questRes[0].active_waypoints);
    return waypointList;
}

async function hasWaypoint(userID, waypoint) {
    let waypointList = await getWaypoints(userID);
    if (waypointList.includes(waypoint)) return true;
    else return false;
}

async function activateWaypoint(user, waypoint) {
	let waypointList = await getWaypoints(user.id);
	let waypointID = await getLocID(user);
    waypointList.push(waypointID);
    let dbUserID = await getUserID(user, false);
	await queryDB("UPDATE rpg_flags SET active_waypoints='"+JSON.stringify(waypointList)+"' WHERE userID="+dbUserID);
}

async function teleport(userID, x, y, json=false, jsonv=[]) {
	let coords = [x,y];
	if(json) coords = jsonv;
	await queryDB("UPDATE users SET location='"+JSON.stringify(coords)+"' WHERE discordID="+userID);
	return makeRPGEmbed("Waypoint Activated", "You teleported to another waypoint!");
}

async function getDungeonWarp(user) {
	let location = await getDungeonLocation(user);
	let dungeonRes = await queryDB("SELECT warp FROM locations_dungeon WHERE coords='"+JSON.stringify(location)+"'");
	return JSON.parse(dungeonRes[0].warp);
}

async function getDungeon(user) {
	let location = await getDungeonLocation(user);
	let dungeonRes = await queryDB("SELECT dungeon FROM locations_dungeon WHERE coords='"+JSON.stringify(location)+"'");
	return dungeonRes[0].dungeon;
}

async function getDungeonLoot(user) {
	let dungeon = await getDungeon(user);
	let dungeonRes = await queryDB("SELECT search_loot FROM location_dungeons WHERE name='"+dungeon+"'");
	return JSON.parse(dungeonRes[0].search_loot);
}

async function getWarp(user) {
	let location = await getLocation(user);
	let warpRes = await queryDB("SELECT warp FROM locations WHERE coords='"+JSON.stringify(location)+"'");
	return JSON.parse(warpRes[0].warp);
}

async function dungeonTeleport(userID, x, y, json=false, jsonv=[]) {
	let coords = [x,y];
	if(json) coords = jsonv;
	await queryDB("UPDATE users SET dungeon_location='"+JSON.stringify(coords)+"' WHERE discordID="+userID);
}

async function resetBattles() {
    await queryDB("UPDATE rpg_flags SET in_battle=0");
    log("\x1b[32m%s\x1b[0m", "DB: Battles reset!");
}

async function getLocLevel(user) {
	let locations, locationRes;
	if(await isInDungeon(user.id)) {
		locations = await getDungeonLocation(user);
		locationRes = await queryDB("SELECT * FROM locations_dungeon WHERE coords='" + JSON.stringify(locations) + "'");
	} else {
		locations = await getLocation(user);
		locationRes = await queryDB("SELECT * FROM locations WHERE coords='" + JSON.stringify(locations) + "'");
	}
    let level = locationRes[0].level;
    return level;
}

async function getLocCalcLevel(user) {
	let locLevel = await getLocLevel(user);
	return locLevel * 5
}

async function canUseAction(user, action) {
	if(await isInDungeon(user.id)) {
		let dungeonActions = await getDungeonActions(user);
		if(dungeonActions.includes(action)) return true;
		else return false;
	}
	const locationType = await getLocType(user);
	const actions = await getLocActions(user);
	const typeActions = await getLocTypeActions(locationType);
    if (actions.includes(action) || typeActions.includes(action)) return true;
    else return false;
}

async function getLocMonsters(user) {
    const locations = await getLocation(user);
    const biome = await getLocBiome(user);
	
    const locationRes = await queryDB("SELECT monster_table FROM locations WHERE coords='" + JSON.stringify(locations) + "'");
	
    let monsters = JSON.parse(locationRes[0].monster_table);
    let biomeMonsters = await getBiomeMonsters(biome);
	
    return monsters.concat(biomeMonsters);
}

async function getLocalMonsters(user) {
    const locations = await getLocation(user);
	
    const locationRes = await queryDB("SELECT monster_table FROM locations WHERE coords='" + JSON.stringify(locations) + "'");
	
    let monsters = JSON.parse(locationRes[0].monster_table);
	
    return monsters;
}

async function getAnyMonster(user) {
    const monsters = await queryDB("SELECT * FROM monsters");
	let randomIndex = randomIntEx(0,monsters.length);
    return monsters[randomIndex].id;
}

async function getRandomMonster(user, local, biome, any, dungeon) {
    let biomeName = await getLocBiome(user);
	let monsterTable = [];
    if(local) monsterTable = monsterTable.concat(await getLocalMonsters(user));
	if(biome) monsterTable = monsterTable.concat(await getBiomeMonsters(biomeName));
	if(dungeon) monsterTable = monsterTable.concat(await getDungeonMonsters(user));
	log('\x1b[32m%s\x1b[0m', 'DB: Monster table is '+monsterTable);
	if(any) return await getAnyMonster();
    let random = randomIntEx(0, monsterTable.length);
	if(monsterTable.length < 1) return false;
    return monsterTable[random];
}

async function addAchProgress(userID, field, value) {
    let dbUserID = await getUserID(userID, true);
    await queryDB("UPDATE achievement_progress SET " + field + "=" + field + "+" + value + " WHERE id=" + dbUserID);
}

async function getLocBiome(user) {
    const locations = await getLocation(user);
    const locationRes = await queryDB("SELECT biome FROM locations WHERE coords='" + JSON.stringify(locations) + "'");
    let biome = locationRes[0].biome;
    return biome;
}

async function getLocType(user) {
    const locations = await getLocation(user);
    const locationRes = await queryDB("SELECT type FROM locations WHERE coords='" + JSON.stringify(locations) + "'");
    let type = locationRes[0].type;
    return type;
}

async function getLocTypeActions(locationType) {
    const locationRes = await queryDB("SELECT location_actions FROM location_types WHERE type_name='" + locationType + "'");
    let actions = JSON.parse(locationRes[0].location_actions);
    return actions;
}

async function getLocActions(user) {
    const locations = await getLocation(user);
    const locationRes = await queryDB("SELECT actions FROM locations WHERE coords='" + JSON.stringify(locations) + "'");
    let actions = JSON.parse(locationRes[0].actions);
    return actions;
}

async function getDungeonLocation(user) {
    const locations = await queryDB("SELECT dungeon_location FROM users WHERE discordID=" + user.id);
    return JSON.parse(locations[0].dungeon_location);
}

async function getDungeonMonsters(user) {
	let dungeon = await getDungeon(user);
    const locations = await queryDB("SELECT monster_table FROM location_dungeons WHERE name='" + dungeon + "'");
    return JSON.parse(locations[0].monster_table);
}

async function getDungeonActions(user) {
    const locations = await getDungeonLocation(user);
    const locationRes = await queryDB("SELECT actions FROM locations_dungeon WHERE coords='" + JSON.stringify(locations) + "'");
    let actions = JSON.parse(locationRes[0].actions);
    return actions;
}

async function getBiomeDrops(biomeName) {
    const biomeRes = await queryDB("SELECT biome_drops FROM location_biomes WHERE name='" + biomeName + "'");
    let drops = JSON.parse(biomeRes[0].biome_drops);
    return drops;
}

async function getBiomeMonsters(biomeName) {
    const biomeRes = await queryDB("SELECT monster_table FROM location_biomes WHERE name='" + biomeName + "'");
    let table = JSON.parse(biomeRes[0].monster_table);
    return table;
}

async function getUserID(user, isID) {
    let userRes;
    if (isID)
        userRes = await queryDB("SELECT id FROM users WHERE discordID=" + user);
    else
        userRes = await queryDB("SELECT id FROM users WHERE discordID=" + user.id);

    let id = userRes[0].id;
    return id;
}

async function isInQuest(user) {
    let userID = await getUserID(user, false);
    const rpgRes = await queryDB("SELECT quest_in_progress FROM rpg_flags WHERE userID=" + userID);
    return rpgRes[0].quest_in_progress;
}

async function isInBattle(user) {
    let userID = await getUserID(user, false);
    const rpgRes = await queryDB("SELECT in_battle FROM rpg_flags WHERE userID=" + userID);
    if (rpgRes[0].in_battle == 0) return false;
    else return true;
}

async function setInBattle(user, inBattle) {
    let userID = await getUserID(user, false);
    await queryDB("UPDATE rpg_flags SET in_battle=" + inBattle + " WHERE userID=" + userID);
}

async function getLocName(user) {
    const locations = await getLocation(user);
    const locationRes = await queryDB("SELECT * FROM locations WHERE coords='" + JSON.stringify(locations) + "'");
    return locationRes[0].name;
}

async function getDungeonLocName(user) {
    const locations = await getDungeonLocation(user);
    const locationRes = await queryDB("SELECT * FROM locations_dungeon WHERE coords='" + JSON.stringify(locations) + "'");
    return locationRes[0].name;
}

// --
// Generate a world tile
//

function isLandTile(x, y, val) {
    return tileType(x, y) != 'ocean' ? val : 0;
}

async function tileType(x, y) {
    var coords = new Array();
    coords.push(x);
    coords.push(y);
    const tiles = await queryDB("SELECT biome FROM locations WHERE coords='" + JSON.stringify(coords) + "'");
    if (tiles && tiles.length)
        return tiles[0].biome;
    else
        return 'ocean';
}

async function generateCoasts(x, y) {
    const topLeft = await isLandTile(x - 1, y - 1, 1);
    const top = await isLandTile(x, y - 1, 2);
    const topRight = await isLandTile(x + 1, y - 1, 4);
    const midLeft = await isLandTile(x - 1, y, 8);
    const midRight = await isLandTile(x + 1, y, 16);
    const botLeft = await isLandTile(x - 1, y + 1, 32);
    const bot = await isLandTile(x, y + 1, 64);
    const botRight = await isLandTile(x + 1, y + 1, 128);
    const oceanIndex = topLeft + top + topRight + midLeft + midRight + botLeft + bot + botRight;
    return oceanIndex;
}

async function hasPath(x, y) {
	var coords = new Array();
    coords.push(x);
    coords.push(y);
    let path = await queryDB("SELECT path FROM locations WHERE coords='" + JSON.stringify(coords) + "'");
	let pathStr = path[0].path;
	if(pathStr.length > 0) return true;
	else return false;
}

async function makeTile(x, y, dungeon=false) {
    var coords = new Array();
    coords.push(x);
    coords.push(y);
    let tiles = await queryDB("SELECT * FROM locations WHERE coords='" + JSON.stringify(coords) + "'");
	if(dungeon) tiles = await queryDB("SELECT * FROM locations_dungeon WHERE coords='" + JSON.stringify(coords) + "'");
    var marker;
    var biome;
	var path;

    if (tiles && tiles.length) {
        marker = tiles[0].marker;
        biome = tiles[0].biome;
		path = tiles[0].path;
    } else {
        //log("\x1b[31m%s\x1b[0m", "DB: Couldn't find tile at x" + x + " y" + y);
        marker = '';
        biome = 'ocean';
		path = '';
		if(dungeon) biome = 'black';
    }


    let imgRaw = './img/tiles/' + biome + '.png';
    let imgMarker = './img/tiles/' + marker + '.png';
	let paths = new Array();
	if(path.length > 0) {
		if(path.indexOf(',') > -1) {
			let pathArray = tiles[0].path.split(',');
			for(let i = 0; i < pathArray.length; i++) {
				paths.push(pathArray[i]);
			}
		}
		else paths.push(tiles[0].path);
	}
	
    let snowflake = new Date().getTime();
    let imgBG = './img/temp/active_' + snowflake + '.png';

    let tpl = await Jimp.read(imgRaw);
    let clone = await tpl.clone().writeAsync(imgBG);
    tpl = await Jimp.read(imgBG);
	
    var centerX = tpl.bitmap.width * 0.5;
    var centerY = tpl.bitmap.height * 0.5;
	
	if(paths.length > 0) {
		for(let pi = 0; pi < paths.length; pi++) {
			let pathTpl = await Jimp.read('./img/tiles/paths/'+paths[pi]+'.png');
			tpl.composite(pathTpl, 0, 0, [Jimp.BLEND_DESTINATION_OVER, 1, 1]);
		}
	}

    if (marker.length > 0) {
        const markerTpl = await Jimp.read(imgMarker);
        tpl.composite(markerTpl, centerX - (markerTpl.bitmap.width * 0.5), centerY - (markerTpl.bitmap.height * 0.5), [Jimp.BLEND_DESTINATION_OVER, 1, 1]);
    }
    //log("\x1b[32m%s\x1b[0m", "DB: Made tile at x"+x+" y"+y);
    return tpl;
}

async function isInDungeon(userID) {
	let userRes = await queryDB("SELECT inDungeon FROM users WHERE discordID="+userID);
	if(userRes[0].inDungeon == 1) return true;
	else return false;
}

async function generateMap(x, y, user) {
    /*let center = await makeTile(x, y);
    let west = await makeTile(x - 1, y);
    let northWest = await makeTile(x - 1, y - 1);
    let north = await makeTile(x, y - 1);
    let northEast = await makeTile(x + 1, y - 1);
    let east = await makeTile(x + 1, y);
    let southEast = await makeTile(x + 1, y + 1);
    let south = await makeTile(x, y + 1);
    let southWest = await makeTile(x - 1, y + 1);*/
	
	let center, west, northWest, north, northEast, east, southEast, south, southWest, map, avatar, avatarMask, marker;
	
	const runAsyncFunctions = async () => {
		
		Promise.all([
			center = await makeTile(x, y),
			west = await makeTile(x - 1, y),
			northWest = await makeTile(x - 1, y - 1),
			north = await makeTile(x, y - 1),
			northEast = await makeTile(x + 1, y - 1),
			east = await makeTile(x + 1, y),
			southEast = await makeTile(x + 1, y + 1),
			south = await makeTile(x, y + 1),
			southWest = await makeTile(x - 1, y + 1),
			map = await new Jimp(300, 300),
			avatar = await Jimp.read(user.displayAvatarURL),
			avatarMask = await Jimp.read('./img/tiles/youMask.png'),
			marker = await Jimp.read('./img/tiles/you.png')
		])
	};

	await runAsyncFunctions();

    map.composite(northWest, 0, 0, [Jimp.BLEND_DESTINATION_OVER, 1, 1]);
    map.composite(north, 100, 0, [Jimp.BLEND_DESTINATION_OVER, 1, 1]);
    map.composite(northEast, 200, 0, [Jimp.BLEND_DESTINATION_OVER, 1, 1]);
    map.composite(west, 0, 100, [Jimp.BLEND_DESTINATION_OVER, 1, 1]);
    map.composite(center, 100, 100, [Jimp.BLEND_DESTINATION_OVER, 1, 1]);
    map.composite(east, 200, 100, [Jimp.BLEND_DESTINATION_OVER, 1, 1]);
    map.composite(southWest, 0, 200, [Jimp.BLEND_DESTINATION_OVER, 1, 1]);
    map.composite(south, 100, 200, [Jimp.BLEND_DESTINATION_OVER, 1, 1]);
    map.composite(southEast, 200, 200, [Jimp.BLEND_DESTINATION_OVER, 1, 1]);

    // Generate player marker
    avatar.resize(38, 38);
    marker.opacity(0.5);
    avatar.mask(avatarMask, 0, 0);
    marker.composite(avatar, 4, 4);
    map.composite(marker, 127, 80);
	map.quality(75);
    const buffer = await map.filterType(0).getBufferAsync('image/jpeg');
    return buffer;
}

async function generateDungeonMap(x, y, user) {
	
	let center, west, northWest, north, northEast, east, southEast, south, southWest;
	
	const runAsyncFunctions = async () => {
		
		Promise.all([
			center = await makeTile(x, y, true),
			west = await makeTile(x - 1, y, true),
			northWest = await makeTile(x - 1, y - 1, true),
			north = await makeTile(x, y - 1, true),
			northEast = await makeTile(x + 1, y - 1, true),
			east = await makeTile(x + 1, y, true),
			southEast = await makeTile(x + 1, y + 1, true),
			south = await makeTile(x, y + 1, true),
			southWest = await makeTile(x - 1, y + 1, true)
		])
	};

	await runAsyncFunctions();

    let map = await new Jimp(300, 300);
    map.composite(northWest, 0, 0, [Jimp.BLEND_DESTINATION_OVER, 1, 1]);
    map.composite(north, 100, 0, [Jimp.BLEND_DESTINATION_OVER, 1, 1]);
    map.composite(northEast, 200, 0, [Jimp.BLEND_DESTINATION_OVER, 1, 1]);
    map.composite(west, 0, 100, [Jimp.BLEND_DESTINATION_OVER, 1, 1]);
    map.composite(center, 100, 100, [Jimp.BLEND_DESTINATION_OVER, 1, 1]);
    map.composite(east, 200, 100, [Jimp.BLEND_DESTINATION_OVER, 1, 1]);
    map.composite(southWest, 0, 200, [Jimp.BLEND_DESTINATION_OVER, 1, 1]);
    map.composite(south, 100, 200, [Jimp.BLEND_DESTINATION_OVER, 1, 1]);
    map.composite(southEast, 200, 200, [Jimp.BLEND_DESTINATION_OVER, 1, 1]);

    // Generate player marker
    const avatar = await Jimp.read(user.displayAvatarURL);
    avatar.resize(38, 38);
    const avatarMask = await Jimp.read('./img/tiles/youMask.png');
    const marker = await Jimp.read('./img/tiles/you.png');
    marker.opacity(0.5);
    avatar.mask(avatarMask, 0, 0);
    marker.composite(avatar, 4, 4);
    map.composite(marker, 127, 80);

    const buffer = await map.filterType(0).getBufferAsync('image/png');
    return buffer;
}

async function getLevel(userID) {
	let userRes = await queryDB("SELECT * FROM users WHERE discordID=" + userID);
	var currentStats = JSON.parse(userRes[0].level);
	var currentLevel = currentStats[0];
	return currentLevel;
}

async function canTournament(userID) {
    let dbUserID = await getUserID(userID, true);
	const userRes = await queryDB("SELECT lastTournament FROM rpg_flags WHERE userID="+dbUserID);
	let currentTime = new Date().getTime();
	let tournamentTime = userRes[0].lastTournament
	let formattedTime = formatTimeUntil(tournamentTime);
	if(currentTime > tournamentTime) {
		await queryDB("UPDATE rpg_flags SET lastTournament=0 WHERE userID="+dbUserID);
		return true;
	} else return formattedTime;
}

async function getHealth(userID) {
	let userRes = await queryDB("SELECT * FROM users WHERE discordID=" + userID);
	var currentStats = JSON.parse(userRes[0].vitality);
	var currentVitality = currentVitality[0];
	return 100+(currentVitality*25);
}

async function getMP(userID) {
	let userRes = await queryDB("SELECT * FROM users WHERE discordID=" + userID);
	var currentStats = JSON.parse(userRes[0].arcana);
	var currentArcana = currentArcana[0];
	return 100+(currentArcana*25);
}

async function generateWorldMap() {
    let map = await new Jimp(1200, 1400);
    var worldY = 8;
    var xOffset = 0;
    var yOffset = 0;
    for (let i = -6; i < worldY; i++) {
        //Each Y
		let tile1, tile2, tile3, tile4, tile5, tile6, tile7, tile8, tile9, tile10, tile11, tile12;
		
		let runAsyncFunctions = async () => {
		
			Promise.all([
				tile1 = await makeTile(-5, i),
				tile2 = await makeTile(-4, i),
				tile3 = await makeTile(-3, i),
				tile4 = await makeTile(-2, i),
				tile5 = await makeTile(-1, i),
				tile6 = await makeTile(0, i),
				tile7 = await makeTile(1, i),
				tile8 = await makeTile(2, i),
				tile9 = await makeTile(3, i),
				tile10 = await makeTile(4, i),
				tile11 = await makeTile(5, i),
				tile12 = await makeTile(6, i)
			])
		};

			await runAsyncFunctions();
			            
            /*let font = await Jimp.loadFont('./fonts/beleren15.fnt');
            tile.print(font, 5, 5, '[' + i2 + ',' + i + ']', 500, 500);
            log("\x1b[32m%s\x1b[0m", "DB: Place world map tile at x" + xOffset + " y" + yOffset);*/
            map.composite(tile1, 0, yOffset, [Jimp.BLEND_DESTINATION_OVER, 1, 1]);
            map.composite(tile2, 100, yOffset, [Jimp.BLEND_DESTINATION_OVER, 1, 1]);
            map.composite(tile3, 200, yOffset, [Jimp.BLEND_DESTINATION_OVER, 1, 1]);
            map.composite(tile4, 300, yOffset, [Jimp.BLEND_DESTINATION_OVER, 1, 1]);
            map.composite(tile5, 400, yOffset, [Jimp.BLEND_DESTINATION_OVER, 1, 1]);
            map.composite(tile6, 500, yOffset, [Jimp.BLEND_DESTINATION_OVER, 1, 1]);
            map.composite(tile7, 600, yOffset, [Jimp.BLEND_DESTINATION_OVER, 1, 1]);
            map.composite(tile8, 700, yOffset, [Jimp.BLEND_DESTINATION_OVER, 1, 1]);
            map.composite(tile9, 800, yOffset, [Jimp.BLEND_DESTINATION_OVER, 1, 1]);
            map.composite(tile10, 900, yOffset, [Jimp.BLEND_DESTINATION_OVER, 1, 1]);
            map.composite(tile11, 1000, yOffset, [Jimp.BLEND_DESTINATION_OVER, 1, 1]);
            map.composite(tile12, 1100, yOffset, [Jimp.BLEND_DESTINATION_OVER, 1, 1]);		
			
        yOffset += 100;
    }
	map.resize(600, Jimp.AUTO);
    const buffer = await map.filterType(0).getBufferAsync('image/jpeg');
    return buffer;
}

async function generateDungeonWorldMap() {
    let map = await new Jimp(1000, 1000);
    var worldX = 10;
    var worldY = 10;
    var xOffset = 0;
    var yOffset = 0;
    for (let i = -1; i < worldY; i++) {
        //Each Y
        for (let i2 = -1; i2 < worldX; i2++) {
            //Each X
            let tile = await makeTile(i2, i, true);
            let font = await Jimp.loadFont('./fonts/beleren15.fnt');
            tile.print(font, 5, 5, '[' + i2 + ',' + i + ']', 500, 500);
            //log("\x1b[32m%s\x1b[0m", "DB: Place world map tile at x" + xOffset + " y" + yOffset);
            map.composite(tile, xOffset, yOffset, [Jimp.BLEND_DESTINATION_OVER, 1, 1]);
            xOffset += 100;
        }
        yOffset += 100;
        xOffset = 0;
    }

    const buffer = await map.filterType(0).getBufferAsync('image/png');
    return buffer;
}

// --
// Generate a random number between min-max EXCLUDING max
// --

function randomIntEx(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

// --
// Generate a random number between min-max INCLUDING max
// --

function randomIntIn(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// --
// Generate a biased random number leaning closer to the minimum
// the higher 'p' is set
// --

function biasedRandom(min, max, p) {
    var bias = Math.pow(Math.random(), p);
    return Math.round(min + (max - min) * bias);
}

// --
// Returns the mean average of an array
// --

function meanAverage(array) {
    var sum = 0;
    for (var i = 0; i < array.length; i++) {
        sum += parseInt(array[i], 10);
    }
    return sum / array.length;
}

// --
// Capitalize first letter of a string
// --

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// --
// Stringify a number (E.G. 1 -> first, 2 -> second)
// --

const special = ['zeroth', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth'];
const deca = ['twent', 'thirt', 'fort', 'fift', 'sixt', 'sevent', 'eight', 'ninet'];

function stringifyNumber(n) {
    if (n < 20) return special[n];
    if (n % 10 === 0) return deca[Math.floor(n / 10) - 2] + 'ieth';
    return deca[Math.floor(n / 10) - 2] + 'y-' + special[n % 10];
}

function getSum(total, num) {
    return total + num;
}

// --
// Return a formatted string displaying the time until a future timestamp
// --

function formatTimeUntil(futureTimestamp, hasDays) {
    var date = new Date();
    var timestamp = date.getTime();
    var timevar = parseInt(futureTimestamp - timestamp);
    var s = Math.floor(timevar / 1000 % 60);
    var m = Math.floor(timevar / 60000 % 60);
    var h = Math.floor(timevar / 3600000 % 24);
    var d = Math.floor(timevar / 86400000);
    if (hasDays) return d + " days, " + h + " hours, " + m + " minutes and " + s + " seconds";
    else return h + " hours, " + m + " minutes and " + s + " seconds";
}

// --
// Return a formatted string displaying the time since a past timestamp
// --

function formatTimeSince(pastTimestamp, hasDays) {
    var date = new Date();
    var timestamp = date.getTime();
    var timevar = parseInt(timestamp - pastTimestamp);
    var s = Math.floor(timevar / 1000 % 60);
    var m = Math.floor(timevar / 60000 % 60);
    var h = Math.floor(timevar / 3600000 % 24);
    var d = Math.floor(timevar / 86400000);
    if (hasDays) return d + " days, " + h + " hours, " + m + " minutes and " + s + " seconds";
    else return h + " hours, " + m + " minutes and " + s + " seconds";
}

function petTypeString(rarityNum) {
    var rarityString = "None";
    if (rarityNum == 6) rarityString = "Common";
    else if (rarityNum == 4) rarityString = "Uncommon";
    else if (rarityNum == 3) rarityString = "Rare";
    else if (rarityNum == 1) rarityString = "Ultra Rare";
    return rarityString;
}

async function webJson(url) {
    var options = {
        url: url,
        headers: {
            'User-Agent': 'request'
        },
        json: true
    }

    try {
        var result = await request(options);
        return result;
    } catch (err) {
        console.error(err);
    }
}

// --
// Generate level / max EXP based on the RuneScape formula
// --

function RSExp() {
    this.equate = function(xp) {
        return Math.floor(xp + 300 * Math.pow(2, xp / 7));
    };

    this.level_to_xp = function(level) {
        var xp = 0;

        for (var i = 1; i < level; i++)
            xp += this.equate(i);

        return Math.floor(xp / 4);
    };

    this.xp_to_level = function(xp) {
        var level = 1;

        while (this.level_to_xp(level) < xp)
            level++;

        return level;
    };

}

function drawXPBar(neededXP, currentXP) {
    var percent = Math.floor((currentXP / neededXP * 100));
    var tens = Math.ceil(percent / 10);
    var barString = "";
    if (tens > 10) tens = 10;
    if (tens < 1) tens = 1;
    for (var i = 0; i < tens; i++) {
        barString = barString + "█";
    }
    while (barString.length < 10) {
        barString = barString + "▁";
    }
    return barString + " " + percent + "%";
}

function delay(ms) {
    return new Promise(function(resolve) {
        setTimeout(resolve, ms);
    });
}

async function giveXP(msg, userID, xp) {
	var rs = new RSExp();
    let userRes = await queryDB("SELECT level FROM users WHERE discordID=" + userID);
    let stats = JSON.parse(userRes[0].level);
	
    stats[1] += xp;
    var newLevels = 0;

    while (stats[1] >= rs.level_to_xp(stats[0] + 1)) {
        stats[1] -= rs.level_to_xp(stats[0] + 1);
        stats[0] += 1;
        newLevels++;
    }
	
	if(stats[1] < 0 || stats[1] === null) stats[1] = 0;

    msg.embed(makeRPGEmbed("XP Gains", "[Lv." + stats[0] + "] **Combat:** +" + Math.floor(xp) + "xp\n*Progress:* [" + drawXPBar(rs.level_to_xp(stats[0] + 1), stats[1]) + "]\n"));

    if (newLevels > 0) {
		if(stats[0] == 5) {
			msg.embed(makeRPGEmbed("Combat Up", "<@"+userID+"> levelled up and is now combat level " + (stats[0]) + "!\n"+
			"You can apply 4 more skill points using `!skill`!\n"+
			"As you're now level 5, you can increase skills to a maximum of 12!"));
		} else {
			msg.embed(makeRPGEmbed("Combat Up", "<@"+userID+"> levelled up and is now combat level " + (stats[0]) + "!\n"+
			"You can apply 4 more skill points using `!skill`!"));
		}
    }

    await queryDB("UPDATE users SET level='" + JSON.stringify(stats) + "' WHERE discordID=" + userID);
}

async function giveCalcXP(msg, userID, xp) {
    var rs = new RSExp();
    let userRes = await queryDB("SELECT level FROM users WHERE discordID=" + userID);
    let stats = JSON.parse(userRes[0].level);

    let minSkillXP = (Math.round(Math.sqrt((Math.sqrt(stats[0]) * 0.25)+xp) * randomIntIn(5, 10) / 2));
    let maxSkillXP = (Math.round(Math.sqrt((Math.sqrt(stats[0]) * 0.25)+xp) * randomIntIn(10, 15) / 2));
    let skillXP = randomIntIn(minSkillXP, maxSkillXP);
    stats[1] += skillXP;
    var newLevels = 0;

    while (stats[1] >= rs.level_to_xp(stats[0] + 1)) {
        stats[1] -= rs.level_to_xp(stats[0] + 1);
        stats[0] += 1;
        newLevels++;
    }
	
	if(stats[1] < 0 || stats[1] === null) stats[1] = 0;

    msg.embed(makeRPGEmbed("XP Gains", "[Lv." + stats[0] + "] **Combat:** +" + Math.floor(skillXP) + "xp\n*Progress:* [" + drawXPBar(rs.level_to_xp(stats[0] + 1), stats[1]) + "]\n"));

    if (newLevels > 0) {
		if(stats[0] == 5) {
			msg.embed(makeRPGEmbed("Combat Up", "<@"+userID+"> levelled up and is now combat level " + (stats[0]) + "!\n"+
			"You can apply 4 more skill points using `!skill`!\n"+
			"As you're now level 5, you can increase skills to a maximum of 12!"));
		} else {
			msg.embed(makeRPGEmbed("Combat Up", "<@"+userID+"> levelled up and is now combat level " + (stats[0]) + "!\n"+
			"You can apply 4 more skill points using `!skill`!"));
		}
    }

    await queryDB("UPDATE users SET level='" + JSON.stringify(stats) + "' WHERE discordID=" + userID);
}

async function deathXP(msg, userID) {
    var rs = new RSExp();
    let userRes = await queryDB("SELECT level FROM users WHERE discordID=" + userID);
    let stats = JSON.parse(userRes[0].level);

    let xpLost = Math.floor(stats[1]/3);
    stats[1] -= xpLost;

    msg.embed(makeRPGEmbed("XP Loss", "Due to losing the battle, you lost **"+xpLost+"** experience points!\n"));
	
    await queryDB("UPDATE users SET level='" + JSON.stringify(stats) + "' WHERE discordID=" + userID);
}

function list(arr, conj = 'and') {
    const len = arr.length;
    return `${arr.slice(0, -1).join(', ')}${len > 1 ? `${len > 2 ? ',' : ''} ${conj} ` : ''}${arr.slice(-1)}`;
}

async function awaitPlayers(msg, max, min, {
    time = 30000
} = {}) {
    const joined = [];
    joined.push(msg.author.id);
    const filter = res => {
        if (res.author.bot) return false;
        if (joined.includes(res.author.id)) return false;
        if (res.content.toLowerCase() !== 'join game') return false;
        joined.push(res.author.id);
        res.react(SUCCESS_EMOJI_ID || '✅').catch(() => null);
        return true;
    };
    const verify = await msg.channel.awaitMessages(filter, {
        max,
        time
    });
    verify.set(msg.id, msg);
    if (verify.size < min) return false;
    return verify.map(message => message.author);
}

async function verify(channel, user, time = 30000) {
    const filter = res => {
        const value = res.content.toLowerCase();
        return res.author.id === user.id && ('yes'.includes(value) || 'no'.includes(value));
    };
    const verify = await channel.awaitMessages(filter, {
        max: 1,
        time
    });
    if (!verify.size) return 0;
    const choice = verify.first().content.toLowerCase();
    if ('yes'.includes(choice)) return true;
    if ('no'.includes(choice)) return false;
    return false;
}

// --
// Export functions
// --

module.exports = {
    queryDB,
    isNormalInteger,
    isNumeric,
    capitalize,
    stringifyNumber,
    formatTimeUntil,
    formatTimeSince,
    RSExp,
    getTimestamp,
    getSum,
    randomIntIn,
    randomIntEx,
    biasedRandom,
    drawXPBar,
    petTypeString,
    delay,
    webJson,
    log,
    takeCoins,
    giveCoins,
    makeTile,
    generateMap,
    generateWorldMap,
    RPGOptions,
    getLocation,
    getLocType,
    getLocName,
    hasItem,
    removeItem,
    addItem,
    hasQuestItem,
    addQuestItem,
    removeQuestItem,
    isInQuest,
    completeQuest,
    makeRPGEmbed,
	makeBJEmbed,
    getQuestItem,
    getQuestsCompleted,
    hasCompletedQuest,
    getLocBiome,
    getLocActions,
    getLocLevel,
    addLogs,
    list,
    verify,
    awaitPlayers,
    calculateAgility,
    calculateFortitude,
    calculateImpact,
    calculatePrecision,
    calculateProwess,
    canUseAction,
    setInBattle,
    isInBattle,
    calculateHP,
    calculateMP,
    getLocMonsters,
    getRandomMonster,
    addOrbs,
    addKeys,
    addCrate,
    addArtifacts,
    addFood,
    addGems,
    getLogType,
    getCrateType,
    getGemType,
    avariceBonus,
    addAchProgress,
    resetBattles,
    getMaterial,
    addMaterial,
    hasMaterial,
	giveXP,
	deathXP,
	teleport,
	getWaypoints,
	activateWaypoint,
	hasWaypoint,
	listWaypoints,
	getLocID,
	getLocCoords,
	getLocNameByID,
	getLevel,
	getHealth,
	getMP,
	canTournament,
	getUserID,
	giveChips,
	hasChips,
	shuffle,
	takeChips,
	addTrash,
	getBiomeDrops,
	getBiomeMonsters,
	isInDungeon,
	generateDungeonMap,
	generateDungeonWorldMap,
	getDungeonWarp,
	dungeonTeleport,
	getWarp,
	getTileID,
	getTilesActivated,
	hasActivatedTile,
	searchRewards,
	getDungeonLoot,
	getDungeonLocName,
	getDungeonLocation,
	activateTile,
	hasPath,
	getLocCalcLevel
};