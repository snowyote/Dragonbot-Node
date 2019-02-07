// --------------------------------
// Important requires and constants
// --------------------------------

const {
    CommandoClient
} = require('discord.js-commando');
const path = require('path');
const Discord = require('discord.js');
const Utils = require("./core/Utils.js");
const config = require("./config.json");

// --------------------------------
// Register the client and commands
// --------------------------------

const client = new CommandoClient({
    commandPrefix: '!',
    unknownCommandResponse: true,
    owner: '194534206217388032',
    disableEveryone: true
});

client.registry
    .registerDefaultTypes()
    .registerGroups([
        ['economy', 'Economy Commands'],
        ['profile', 'Profile Commands'],
        ['rpg', 'RPG Commands'],
        ['server', 'Server Commands'],
        ['fun', 'Fun Commands'],
        ['pet', 'Pet Commands']
    ])
    .registerDefaultGroups()
    .registerDefaultCommands()
    .registerCommandsIn(path.join(__dirname, 'commands'));

// -------------------------------
// Set up the new day announcement
// -------------------------------

async function newDay() {
    var serverStartTime = new Date("2018-06-15").getTime();
    var midnight = new Date();
    midnight.setHours(24);
    midnight.setMinutes(0);
    midnight.setSeconds(0);
    midnight.setMilliseconds(0);
    var timeUntilMidnight = (midnight.getTime() - new Date().getTime());
    Utils.log("\x1b[36m%s\x1b[0m", "New Day Check: " + timeUntilMidnight + "ms until midnight!");
	await Utils.delay(timeUntilMidnight);
    const newDayMsg = new Discord.RichEmbed()
		.setAuthor("House of Dragons", "https://i.imgur.com/CyAb3mV.png")
		.setThumbnail("https://i.imgur.com/CfosMZR.png")
		.addField("New Day Alert",
			"It's midnight in GMT and so begins a new day!\n\n" +
			"It has been **" + Utils.formatTimeSince(serverStartTime, true) + "** since the House of Dragons began!\n\n" +
			"The purge is commencing! Any guests who have not accepted the rules will now be kicked!\n\n" +
			"As of now, there are **" + client.users.size + "** members of the House of Dragons, including bots!")
	await kickGuests();
    client.channels.get('498945652114587651').send(newDayMsg);
    newDay();
}

// ----------------------------
// Set up the timed pet updates
// ----------------------------

async function petUpdates() {
    await Utils.delay(10000);
    let petSQL = await Utils.queryDB("SELECT * FROM pets");

    if (petSQL.length > 0) {
        var currentTime = new Date().getTime();
        for (var i = 0; i < petSQL.length; i++) {
            if (petSQL[i].isSleeping == 1) {
                var sleepTime = petSQL[i].sleepTime;
                if (currentTime > sleepTime) {
                    await Utils.queryDB("UPDATE pets SET isSleeping = 0 WHERE id=" + petSQL[i].id);
                    Utils.log("\x1b[36m%s\x1b[0m", "DB: Waking up pet");
                    client.users.get(petSQL[i].ownerName).send("Your active pet **" + petSQL[i].name + "** has woken up!");
                }
            }
            if (petSQL[i].isEgg == 1) {
                var hatchTime = petSQL[i].hatchTime;
                if (currentTime > hatchTime) {
                    Utils.log("\x1b[36m%s\x1b[0m", "DB: Updated pet ID " + petSQL[i].id + " to egg status 0!");
                    let petType = await Utils.queryDB("SELECT id, name, rarity FROM pet_types");
                    var pets = new Array();
                    var petsWeight = new Array();
                    for (var pi = 0; pi < petType.length; pi++) {
                        pets.push(petType[pi].id);
                        petsWeight.push(petType[pi].rarity);
                    }
                    var totalweight = eval(petsWeight.join("+"));
                    var weighedpets = new Array();
                    var currPet = 0;
                    while (currPet < pets.length) {
                        for (var pw = 0; pw < petsWeight[currPet]; pw++)
                            weighedpets[weighedpets.length] = pets[currPet];
                        currPet++;
                    }

                    var randomnumber = Math.floor(Math.random() * totalweight);

                    var randomPetID = weighedpets[randomnumber];
                    var petName = petType[randomPetID - 1].name;
                    var rarity = Utils.petTypeString(petType[randomPetID - 1].rarity);

                    let bgType = await Utils.queryDB("SELECT id, name FROM backgrounds");
                    var randomBG = Math.floor(Math.random() * bgType.length);
                    var bgName = bgType[randomBG].name;
                    var bgID = bgType[randomBG].id;

                    await Utils.queryDB("UPDATE pets SET petType=" + randomPetID + ", bgType=" + bgID + " WHERE id=" + petSQL[i].id);
                    await Utils.queryDB("UPDATE pets SET isEgg=0 WHERE id=" + petSQL[i].id);
                    Utils.log("\x1b[36m%s\x1b[0m", "DB: Hatching pet!");
                    client.users.get(petSQL[i].ownerName).send("Your pet has hatched into a **" + petName + "** (**" + rarity + "**)!");
                }
            }
        }
    }
    await petUpdates();
}

// -----------------------------------
// Add users to database, achievements
// -----------------------------------

async function updateUser(member, message) {
	try{
		let queryRes = await Utils.queryDB("SELECT * FROM users WHERE discordID=" + member);
		if (queryRes && queryRes.length) {
			var userID = queryRes[0].id;
			var active = queryRes[0].activePet;
			let petRes = await Utils.queryDB("SELECT * FROM pets WHERE id=" + active);
			let userAch = await Utils.queryDB("SELECT achievements FROM users WHERE id=" + userID)
			var AchJSON = JSON.parse(userAch[0].achievements);
			var postCount = queryRes[0].xp;
			if(petRes && petRes.length) {
				var petLvl = petRes[0].level;
				var foodStored = queryRes[0].food;
				var petID = JSON.parse(queryRes[0].petID);
				await Utils.queryDB("UPDATE users SET xp = xp + 1 WHERE discordID = " + member);
				await Utils.queryDB("UPDATE server SET jackpotAmount = jackpotAmount + 1 WHERE id = 1");
				var urCount = 0;
				var rCount = 0;
				if(active > 0) {
					for (var pi = 0; pi < petID.length; pi++) {
						let newPetRes = await Utils.queryDB("SELECT * FROM pets WHERE id=" + petID[pi]);
						var type = newPetRes[0].petType;
						let petTypeRes = await Utils.queryDB("SELECT * FROM pet_types WHERE id=" + type);
						var rarity = petTypeRes[0].rarity;
						if (rarity == 1) urCount++;
						if (rarity == 3) rCount++;
					}
				}
				var equipmentList = JSON.parse(queryRes[0].equipmentList);
				const itemRes = await Utils.queryDB("SELECT * FROM items");
				var hasHG = 0;
				var hasTR = 0;
				var hasPW = 0;
				var hasMI = 0;
				if (equipmentList.length > 0) {
					for (var i = 0; i < equipmentList.length; i++) {
						var iType = itemRes[equipmentList[i] - 1].type;
						if (iType == "Headgear") {
							hasHG++;
						}
						if (iType == "Trinket") {
							hasTR++;
						}
						if (iType == "Power") {
							hasPW++;
						}
						if (iType == "Misc") {
							hasMI++;
						}
					}
				}
				
				var equipCount = hasHG + hasTR + hasPW + hasMI;
				
				await Utils.queryDB("UPDATE achievement_progress SET hgNumber=" + hasHG + ", trNumber=" + hasTR + ", pwNumber=" + hasPW + ", petLevel=" + petLvl + ", ultraRareOwned=" + urCount + ", rareOwned=" + rCount + ", achUnlocked=" + AchJSON.length + ", foodStored=" + foodStored + ", equipCount=" + equipCount + " WHERE id=" + userID);
				
				Utils.log("\x1b[36m%s\x1b[0m", "DB: Updated achievement_progress for user ID " + userID);
			}

			let achProgRes = await Utils.queryDB("SELECT * FROM achievement_progress WHERE id=" + userID)
			var achKeys = Object.keys(achProgRes[0]);
			let achRes = await Utils.queryDB("SELECT id, varToCheck, varRequired, name, description FROM achievements")

			for (var index = 0; index < achRes.length; index++) {
				let i = index;
				let achievement = achRes[i];
				var varToCheck = parseInt(achievement.varToCheck);
				var varRequired = parseInt(achievement.varRequired);
				if (achProgRes[0][achKeys[varToCheck]] >= varRequired) {
					if (AchJSON.includes(i + 1) == false) {
						// doesn't have achievement
						const achUnlock = new Discord.RichEmbed()
							.setAuthor("Unlocked Achievement", "https://i.imgur.com/CyAb3mV.png")
							.setColor("#FDF018")
							.addField("Congratulations!", "<@" + member + "> - The achievement **" + achievement.name + "** has been unlocked for completing the objective: *" + achievement.description + "*!\nUse `hod?achievements` to check your progress!")
						client.channels.get(message.channel.id).send(achUnlock);
						AchJSON.push(i + 1);
						var JSONString = JSON.stringify(AchJSON);
						await Utils.queryDB("UPDATE users SET achievements='" + JSONString + "' WHERE id=" + userID);
						Utils.log("\x1b[36m%s\x1b[0m", "DB: Added achievement " + achievement.id + " to user " + userID);
					}
				}
			}
		} else {
			Utils.log("\x1b[36m%s\x1b[0m", "DB: " + member + " was NOT found, adding to database!");
			let addMemberRes = await Utils.queryDB("INSERT INTO users(discordID) VALUES (" + member + "); ");
			Utils.log("\x1b[36m%s\x1b[0m", "DB: " + member + " successfully added to database as ID " + addMemberRes.insertId + "!");
			let addAchievementQuery = Utils.queryDB("INSERT INTO achievement_progress(id) VALUES (" + addMemberRes.insertId + ")");
			Utils.log("\x1b[36m%s\x1b[0m", "DB: Successfully added to achievement_progress!");
		}
	} catch(err) {
		Utils.log("\x1b[31m%s\x1b[0m", "DB: Error in updating user: "+ err.stack);
	}
}

// --------------------------
// THE PURGE COMMENCES REEEEE
// --------------------------

async function kickGuests() {
	const list = client.guilds.get("456965754827571202");
	var currentTime = Utils.getTimestamp;
	var kickNum = 0;
	list.members.forEach(async member => {
		let hasGuestRole = member.roles.some(role => role.name == "Guests");
		let joinTime = member.joinedTimestamp + 172800;
		if(joinTime > currentTime) {
			await member.kick();
			client.channels.get('495610171759001621').send(member.displayName+" has been kicked for being inactive in the entrance for longer than 2 days.");
			kickNum++;
		}
	});
	return kickNum; 
}

// -------------------------------
// Let's a-go!
// -------------------------------

client.on('message', async message => {
    if (message.author.bot) return;
	//Utils.log("\x1b[33m%s\x1b[0m", "\nMSG: ["+message.channel.name+"] "+message.author.username+": "+message+"\n");
    await updateUser(message.author.id, message);
});

client.on('ready', () => {
    Utils.log("\x1b[36m%s\x1b[0m", "Bot has started, with " + client.users.size + " users!");
    client.user.setActivity("with dragon butts");
    newDay();
    petUpdates();
});

client.on('guildMemberAdd', (member) => {
	client.channels.get('510012571953397762').send(`🚪👉 <@${member.id}> has joined the server.`);
});

client.on('guildMemberRemove', (member) => {
	client.channels.get('510012571953397762').send(`🚪👈 ${member.displayName} has left the server.`);
});

client.login(config.token);