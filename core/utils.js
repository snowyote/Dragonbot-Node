const mysql = require('promise-mysql');
const Jimp = require('jimp');
const Discord = require('discord.js');
const request = require('request-promise');
const configFile = require("../config.json");

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
        log("\x1b[36m%s\x1b[0m", "DB: Running query: " + sql);
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

async function takeCoins(userID, coins) {
    await queryDB("UPDATE users SET coins=coins-" + coins + " WHERE discordID=" + userID);
    log("\x1b[32m%s\x1b[0m", "Utils: Took " + coins + " coins from " + userID);
}

async function giveCoins(userID, coins) {
    await queryDB("UPDATE users SET coins=coins+" + coins + " WHERE discordID=" + userID);
    log("\x1b[32m%s\x1b[0m", "Utils: Gave " + coins + " coins to " + userID);
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
    const userRes = await queryDB("SELECT vitality FROM users WHERE discordID=" + userID);
    let vitality = userRes[0].vitality;
    let baseVitality = 100;
    return baseVitality + (vitality * skillMultiplier);
}

async function calculateMP(userID) {
    const skillMultiplier = 25;
    const userRes = await queryDB("SELECT arcana FROM users WHERE discordID=" + userID);
    let arcana = userRes[0].arcana;
    let baseArcana = 100;
    return baseArcana + (arcana * skillMultiplier);
}

async function calculateProwess(userID) {
    const skillMultiplier = 5;
    const userRes = await queryDB("SELECT prowess FROM users WHERE discordID=" + userID);
    let prowess = 0;
    if (userRes && userRes.length) prowess = userRes[0].prowess;
    return prowess * skillMultiplier;
}

async function calculateFortitude(userID) {
    const skillMultiplier = 5;
    const userRes = await queryDB("SELECT fortitude FROM users WHERE discordID=" + userID);
    let fortitude = 0;
    if (userRes && userRes.length) fortitude = userRes[0].fortitude;
    return fortitude * skillMultiplier;
}

async function calculatePrecision(userID) {
    const skillMultiplier = 5;
    const userRes = await queryDB("SELECT precise FROM users WHERE discordID=" + userID);
    let precise = 0;
    if (userRes && userRes.length) precise = userRes[0].precise;
    return precise * skillMultiplier;
}

async function calculateAgility(userID) {
    const skillMultiplier = 5;
    const userRes = await queryDB("SELECT agility FROM users WHERE discordID=" + userID);
    let agility = 0;
    if (userRes && userRes.length) agility = userRes[0].agility;
    return agility * skillMultiplier;
}

async function calculateImpact(userID) {
    const skillMultiplier = 5;
    const userRes = await queryDB("SELECT impact FROM users WHERE discordID=" + userID);
    let impact = 0;
    if (userRes && userRes.length) impact = userRes[0].impact;
    return impact * skillMultiplier;
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
        log("DB: Added item ID " + item);
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

    let itemNeeded = questRes[0].itemNeeded;

    await removeQuestItem(userID, itemNeeded);

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
            } else log("DB: Removed item ID " + item);
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
        log("DB: Added item ID " + item);
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
}

async function getLogType(logID) {
    let logRes = await queryDB("SELECT name, icon FROM log_types WHERE index=" + logID);
    return logRes[0].name;
}

async function getCrateType(crateID) {
    let crateRes = await queryDB("SELECT name FROM crate_types WHERE index=" + crateID);
    return crateRes[0].name;
}

async function getGemType(gemID) {
    let gemRes = await queryDB("SELECT name, icon FROM gem_types WHERE index=" + gemID);
    return gemRes[0].name;
}

async function addGems(userID, gemID, amount) {
    const userRes = await queryDB("SELECT gems FROM users WHERE discordID=" + userID);
    let gemList = JSON.parse(userRes[0].gems);
    gemList[gemID] += amount;
    await queryDB("UPDATE users SET gems='" + JSON.stringify(gemList) + "' WHERE discordID=" + userID);
}

async function addCrate(userID, crateID, amount) {
    const userRes = await queryDB("SELECT crate FROM users WHERE discordID=" + userID);
    let crateList = JSON.parse(userRes[0].crate);
    crateList[crateID] += amount;
    await queryDB("UPDATE users SET crate='" + JSON.stringify(crateList) + "' WHERE discordID=" + userID);
}

// --
// Check if string is numeric
// --

function isNumeric(num) {
    return !isNaN(num)
}

async function RPGOptions(coords) {
    //log(coords);
    const locations = await queryDB("SELECT * FROM locations WHERE coords='" + coords + "'");
    let actions = JSON.parse(locations[0].actions);
    //log(actions);
    var opt = "";
    if (actions.includes('market')) opt = opt + '**Market** (*!market*)\n';
    if (actions.includes('explore')) opt = opt + '**Explore** (*!explore*)\n';
    if (actions.includes('talk')) opt = opt + '**Talk** (*!talk*)\n';
    if (actions.includes('rest')) opt = opt + '**Rest** (*!rest*)\n';
    if (actions.includes('fish')) opt = opt + '**Fish** (*!fish*)\n';
    if (actions.includes('chop')) opt = opt + '**Chop Trees** (*!chop*)\n';
    if (actions.includes('mine')) opt = opt + '**Mine** (*!mine*)\n';
    if (actions.includes('battle')) opt = opt + '**Battle** (*!battle*)\n';

    opt = opt.slice(0, -1);
    return opt;
}

async function getLocation(user) {
    const locations = await queryDB("SELECT location FROM users WHERE discordID=" + user.id);
    return JSON.parse(locations[0].location);
}

async function getLocType(user) {
    const locations = await getLocation(user);
    const locationRes = await queryDB("SELECT * FROM locations WHERE coords='" + JSON.stringify(locations) + "'");
    let type = locationRes[0].type;
    return type;
}

async function resetBattles() {
    await queryDB("UPDATE rpg_flags SET in_battle=0");
    log("\x1b[32m%s\x1b[0m", "DB: Battles reset!");
}

async function getLocLevel(user) {
    const locations = await getLocation(user);
    const locationRes = await queryDB("SELECT * FROM locations WHERE coords='" + JSON.stringify(locations) + "'");
    let level = locationRes[0].level;
    return level;
}

async function canUseAction(user, action) {
    let actions = await getLocActions(user);
    if (actions.includes(action)) return true;
    else return false;
}

async function getLocActions(user) {
    const locations = await getLocation(user);
    const locationRes = await queryDB("SELECT actions FROM locations WHERE coords='" + JSON.stringify(locations) + "'");
    let actions = JSON.parse(locationRes[0].actions);
    return actions;
}

async function getLocMonsters(user) {
    const locations = await getLocation(user);
    const locationRes = await queryDB("SELECT monsterTable FROM locations WHERE coords='" + JSON.stringify(locations) + "'");
    let monsters = JSON.parse(locationRes[0].monsterTable);
    return monsters;
}

async function getRandomMonster(user) {
    let monsterTable = await getLocMonsters(user);
    let random = randomIntEx(0, monsterTable.length);
    return monsterTable[random];
}

async function addAchProgress(userID, field, value) {
    let dbUserID = await getUserID(userID, true);
    await queryDB("UPDATE achievement_progress SET " + field + "=" + field + "+" + value + " WHERE id=" + dbUserID);
}

async function getLocBiome(user) {
    const locations = await getLocation(user);
    const locationRes = await queryDB("SELECT * FROM locations WHERE coords='" + JSON.stringify(locations) + "'");
    let biome = locationRes[0].biome;
    return biome;
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

async function makeTile(x, y) {
    var coords = new Array();
    coords.push(x);
    coords.push(y);
    const tiles = await queryDB("SELECT * FROM locations WHERE coords='" + JSON.stringify(coords) + "'");
    var marker;
    var biome;

    if (tiles && tiles.length) {
        var marker = tiles[0].marker;
        var biome = tiles[0].biome;
    } else {
        log("\x1b[31m%s\x1b[0m", "DB: Couldn't find tile at x" + x + " y" + y);
        marker = '';
        biome = 'ocean';
    }


    let imgRaw = './img/tiles/' + biome + '.png';
    let imgMarker = './img/tiles/' + marker + '.png';
    let snowflake = new Date().getTime();
    let imgBG = './img/temp/active_' + snowflake + '.png';

    let tpl = await Jimp.read(imgRaw);
    let clone = await tpl.clone().writeAsync(imgBG);
    tpl = await Jimp.read(imgBG);

    if (marker.length > 0) {
        const markerTpl = await Jimp.read(imgMarker);
        var centerX = tpl.bitmap.width * 0.5;
        var centerY = tpl.bitmap.height * 0.5;
        tpl.composite(markerTpl, centerX - (markerTpl.bitmap.width * 0.5), centerY - (markerTpl.bitmap.height * 0.5), [Jimp.BLEND_DESTINATION_OVER, 1, 1]);
    }
    //log("\x1b[32m%s\x1b[0m", "DB: Made tile at x"+x+" y"+y);
    return tpl;
}

async function generateMap(x, y, user) {
    let center = await makeTile(x, y);
    let west = await makeTile(x - 1, y);
    let northWest = await makeTile(x - 1, y - 1);
    let north = await makeTile(x, y - 1);
    let northEast = await makeTile(x + 1, y - 1);
    let east = await makeTile(x + 1, y);
    let southEast = await makeTile(x + 1, y + 1);
    let south = await makeTile(x, y + 1);
    let southWest = await makeTile(x - 1, y + 1);

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

async function generateWorldMap() {
    let map = await new Jimp(1400, 1400);
    var worldX = 10;
    var worldY = 10;
    var xOffset = 0;
    var yOffset = 0;
    for (let i = -5; i < worldY; i++) {
        //Each Y
        for (let i2 = -5; i2 < worldX; i2++) {
            //Each X
            let tile = await makeTile(i2, i);
            let font = await Jimp.loadFont('./fonts/beleren15.fnt');
            tile.print(font, 5, 5, '[' + i2 + ',' + i + ']', 500, 500);
            log("\x1b[32m%s\x1b[0m", "DB: Place world map tile at x" + xOffset + " y" + yOffset);
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
        msg.embed(makeRPGEmbed("Combat Up", "<@"+userID+"> levelled up and is now combat level " + (stats[0]) + "! You can apply 4 more skill points using `!skill`!"));
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
    time = 30000,
    dmCheck = false
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
    if (dmCheck) {
        for (const message of verify.values()) {
            try {
                await message.author.send('Hi! Just testing that DMs work, pay this no mind.');
            } catch (err) {
                verify.delete(message.id);
            }
        }
    }
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
	deathXP
};