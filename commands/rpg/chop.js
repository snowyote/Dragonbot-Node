const {
    Command
} = require('discord.js-commando');
const Utils = require('../../core/utils.js');
const Discord = require('discord.js');

module.exports = class ChopCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'chop',
            group: 'rpg',
            memberName: 'chop',
            description: 'Chop down trees for resources',
            examples: ['chop'],
            throttling: {
                usages: 1,
                duration: 10
            }
        });
    }

    async run(msg) {
        const noticeMsg = new Discord.RichEmbed()
            .setAuthor("World of the House of Dragons", "https://i.imgur.com/CyAb3mV.png")
            .setDescription("<@" + msg.author.id + ">")

        if (await Utils.hasCompletedQuest(msg.author.id, 1)) {
            if (await Utils.getLocType(msg.author) == 'forest') {
                let queryRes = await Utils.queryDB("SELECT * FROM users WHERE discordID=" + msg.author.id);
                Utils.log("\x1b[36m%s\x1b[0m", "DB: Selected user ID " + msg.author.id);
                var userID = queryRes[0].id;
                var active = queryRes[0].activePet;
                if (active > 0) {
                    var locationType = await Utils.getLocType(msg.author);
                    var locationBiome = await Utils.getLocBiome(msg.author);
                    var possibleRewards = new Array();

                    switch (locationBiome) {
                        case 'plains':
                            possibleRewards.push('Oak', 'Pine');
                            break;
                        case 'desert':
                            possibleRewards.push('Palm');
                            break;
                        case 'snow':
                            possibleRewards.push('Oak', 'Pine', 'Festive');
                            break;
                        case 'ashen':
                            possibleRewards.push('Spirit');
                            break;
                    }
					
					if(possibleRewards.length > 0) {
						let petRes = await Utils.queryDB("SELECT * FROM pets WHERE id=" + active);
						var staminaBoost = petRes[0].staminaBoost;
						var foodBoost = petRes[0].foodBoost;
						var petLvl = petRes[0].level;
						var isEgg = petRes[0].isEgg;
						var isSleeping = petRes[0].isSleeping;
						var sleepTime = petRes[0].sleepTime;
						var petStamina = petRes[0].stamina;
						var food = queryRes[0].food;
						if (staminaBoost == 5) staminaBoost = 20;
						if (isEgg == 0) {
							if (petStamina >= (20 - staminaBoost)) {
								if (isSleeping == 0) {
									var staminaUsed = (20 - staminaBoost);
									var foodUsed = petLvl;
									if (foodBoost > 0) foodUsed = 0;

									if (food >= foodUsed) {
										var sharpness = petRes[0].axeSharpness;
										Utils.log("\x1b[36m%s\x1b[0m", "DB: Sharpness is " + sharpness + "\nDB: Check: " + (sharpness > 0));
										if (sharpness > 0) {
											await Utils.queryDB("UPDATE pets SET stamina=stamina-" + staminaUsed + " WHERE id=" + active);
											await Utils.queryDB("UPDATE users SET food=food-" + foodUsed + " WHERE discordID=" + msg.author.id);
											Utils.log("\x1b[36m%s\x1b[0m", "DB: Used " + staminaUsed + " stamina and " + foodUsed + " food!");
											let achRes = await Utils.queryDB("SELECT * FROM achievement_progress WHERE id=" + userID);
											let petRes = await Utils.queryDB("SELECT * FROM pets WHERE id=" + active);
											let userRes = await Utils.queryDB("SELECT * FROM users WHERE discordID=" + msg.author.id);
											petStamina = petRes[0].stamina;
											food = userRes[0].food;
											var petXP = petRes[0].exp;
											var petName = petRes[0].name;
											var petMaxStamina = petRes[0].maxStamina;
											var intelligence = petRes[0].intelligence + (petRes[0].intelBoost);
											var luck = petRes[0].luck + (petRes[0].luckBoost);
											var avarice = petRes[0].avarice + petRes[0].avariceBoost;
											var strength = JSON.parse(petRes[0].strength);
											var equipList = JSON.parse(queryRes[0].equipmentList);
											var coinsGained = 0;
											var gcratesFound = 0;
											var logs = JSON.parse(queryRes[0].logs);
											var battlesWon = 0;
											var crate = JSON.parse(userRes[0].crate);
											var caveDepth = 0;
											var logsCut = 0;
											var artifactsGained = 0;
											var expGained = 0;
											var coins = queryRes[0].coins;
											var petType = petRes[0].petType;

											if (equipList == "" || equipList === null) {
												equipList = new Array();
											}

											const items = await Utils.queryDB("SELECT * FROM items");

											const embedMsg = new Discord.RichEmbed()
												.setAuthor(petName + "'s Deforestation", "https://i.imgur.com/CyAb3mV.png")
												.setFooter("📝 Please wait 10 seconds before woodcutting again..")
												
											var reward = [];
											var probability = 3 - (Math.floor(luck / 10));
											if (probability < 1.6) probability = 1.6;
											var amountOfTrees = Utils.biasedRandom(1, 3, (4 - Math.floor(luck / 10)));
											Utils.log("\x1b[36m%s\x1b[0m", "DB: Luck random: " + probability);
											var randomCheck = Utils.biasedRandom(0, possibleRewards.length-1, probability);
											let rewardCheck, rewardType, rewardName, rewardMsg;
											var totalXPGain = 0;
											var varToChange = new Array();
											var valueToAdd = new Array();
											var staminaAdd = 0;
											var randomAmount = 0;
											var findMsg = "";
											let sharpnessChance = Utils.randomIntIn(1,100);
											if (sharpnessChance <= 50) sharpness -= 5;
											if (sharpness < 0) sharpness = 0;
											
											const logRes = await Utils.queryDB("SELECT * FROM log_types");
											
											for (var ex = 0; ex < amountOfTrees; ex++) {
												randomCheck = Utils.biasedRandom(0, possibleRewards.length-1, probability);
												Utils.log("\x1b[36m%s\x1b[0m", "DB: Chop");
												
												for(var i = 0; i < logRes.length; i++) {
													if(possibleRewards[randomCheck] == logRes[i].name) {
														randomAmount = Utils.randomIntIn(1 * (strength[0] + 1), 2 * (strength[0] + 1));
														logsCut += randomAmount;
														findMsg = findMsg + logRes[i].icon + " ...chopped down 1 " + logRes[i].name + " Tree, collecting **" + randomAmount + "** " + logRes[i].name + " Logs!\n";
														await Utils.addLogs(msg.author.id, i, randomAmount);
													}
												}

												var birdNestRandom = Utils.randomIntIn(1, 100);
												var nestChance = strength[0] + luck;
												if (nestChance > 5) nestChance = 5;
												Utils.log("\x1b[36m%s\x1b[0m", "DB: Bird nest random: " + birdNestRandom + ", chance: " + nestChance);
												if (birdNestRandom <= nestChance) {
													randomAmount = Math.floor((Utils.randomIntIn(50 * (strength[0] + 1), 250 * (strength[0] + 1))) * ((avarice+1) / 20));
													coinsGained += randomAmount;
													await Utils.giveCoins(msg.author.id, randomAmount);
													findMsg = findMsg + "🐤 ...found a bird nest in the tree, containing **" + randomAmount + "** coins!\n";
												}
											}

											embedMsg.addField("Found while chopping trees...", findMsg);
											embedMsg.setDescription("💚 (" + petStamina + "/" + petMaxStamina + ")\nAxe Sharpness: (" + sharpness + "/100)");

											var rs = new Utils.RSExp();

											// Generate normal EXP

											var xpFromReward = Utils.randomIntIn((intelligence * 5) + 1, (intelligence * 20) + 50);

											// Bonus from chance + intelligence stat

											var bonus = (randomCheck * petLvl) + (petLvl * 5) + (Utils.randomIntIn(petRes[0].caveDepth, petRes[0].caveDepth * 2));

											var levelXP = rs.level_to_xp(petLvl) / 100;
											if (petLvl > 100) levelXP = rs.level_to_xp(petLvl) / 10000;
											if (petLvl > 200) levelXP = rs.level_to_xp(petLvl) / 1000000;
											if (petLvl > 300) levelXP = rs.level_to_xp(petLvl) / 1000000000;
											if (petLvl > 400) levelXP = rs.level_to_xp(petLvl) / 10000000000;
											levelXP = Utils.randomIntIn(petLvl, levelXP);

											totalXPGain += bonus + xpFromReward + levelXP;

											if (intelligence > 0) {
												var intelPercent = intelligence * 5;
												totalXPGain = totalXPGain + (totalXPGain / intelPercent)
											}

											// Level bonus
											if (totalXPGain > 1000000) totalXPGain = 1000000;

											expGained = totalXPGain;

											// Calculating level progress from RuneScape algorithm
											var newXP = Math.floor(petXP + totalXPGain);
											var newLvl = petLvl;
											var newSP = 0;

											while (newXP >= rs.level_to_xp(newLvl + 1)) {
												newXP -= rs.level_to_xp(petLvl + 1);
												newLvl += 1;
											}

											let minSkillXP = Math.round(Math.sqrt((Math.sqrt(strength[0]) * 0.25) * Utils.randomIntIn(5, 10) / 2));
											let maxSkillXP = Math.round(Math.sqrt((Math.sqrt(strength[0]) * 0.25) * Utils.randomIntIn(10, 15 + (intelligence / 10)) / 2));
											let skillIntel = 0;
											let skillXP = Utils.randomIntIn(minSkillXP, maxSkillXP);
											if (intelligence > 0) {
												skillIntel = (intelligence / 5);
												skillXP = skillXP + (skillXP / skillIntel);
											}
											strength[1] += skillXP;
											var dexGained = 0;

											while (strength[1] >= rs.level_to_xp(strength[0] + 1)) {
												strength[1] -= rs.level_to_xp(strength[0] + 1);
												strength[0] += 1;
												dexGained++;
											}

											var neededXP = rs.level_to_xp(newLvl + 1);

											embedMsg.addField("XP Gains",
												"[Lv." + newLvl + "] **Affection:** +" + Math.floor(totalXPGain) + "xp (" + intelPercent + "% Intelligence Bonus)\n*Progress:* [" + Utils.drawXPBar(neededXP, newXP) + "]\n" +
												"[Lv." + strength[0] + "] **Strength:** +" + Math.floor(skillXP) + "xp (" + skillIntel + "% Intelligence Bonus)\n*Progress:* [" + Utils.drawXPBar(rs.level_to_xp(strength[0] + 1), strength[1]) + "]\n");

											// If levelled up at all...

											if (newLvl > petLvl) {
												embedMsg.addField("Affection Up", petName + " levelled up and is now affection level " + (newLvl) + "!");
												newSP = (newLvl - petLvl);
											}

											if (dexGained > 0) {
												embedMsg.addField("Strength Up", petName + " levelled up and is now strength level " + (strength[0]) + "!");
											}

											/* -----------------------------------------------------------------------
											   Final section - sends the message!
											----------------------------------------------------------------------- */

											await Utils.queryDB("UPDATE pets SET axeSharpness=" + sharpness + ", exp=" + newXP + ", strength='" + JSON.stringify(strength) + "', level=" + newLvl + ", skillPoints=skillPoints+" + newSP + ", stamina=stamina+" + staminaAdd + " WHERE id=" + active);
											await Utils.queryDB("UPDATE achievement_progress SET gcratesFound=gcratesFound+" + gcratesFound + ", logsCut=logsCut+" + logsCut + ", staminaUsed=staminaUsed+" + staminaUsed + ", coinsGained=coinsGained+" + coinsGained + ", expGained=expGained+" + expGained + " WHERE id=" + userID);

											return msg.embed(embedMsg);

										} else {
											noticeMsg.addField("Can't Cut Trees", "Your axe is too dull to chop trees! Sharpen it with `!sharpen`!");
											return msg.embed(noticeMsg);
										}
									} else {
										noticeMsg.addField("Can't Cut Trees", "Your pet is begging for food and won't chop trees, buy some more with `!market`!");
										return msg.embed(noticeMsg);
									}
								} else {
									noticeMsg.addField("Can't Cut Trees", "This pet is currently sleeping and will wake up in **" + Utils.formatTimeUntil(sleepTime) + "**!");
									return msg.embed(noticeMsg);
								}
							} else {
								noticeMsg.addField("Can't Cut Trees", "No stamina, use `!sleep` to recover!");
								return msg.embed(noticeMsg);
							}
						} else {
							noticeMsg.addField("Can't Cut Trees", "Your current pet's not hatched yet, use `!hatch` to check up on it!");
							return msg.embed(noticeMsg);
						}
					} else {
						noticeMsg.addField("Can't Cut Trees", "You can't cut any trees here!");
						return msg.embed(noticeMsg);
					}
                } else {
                    noticeMsg.addField("Can't Cut Trees", "You don't have any pets to cut trees with, use `!adopt` to get one!");
                    return msg.embed(noticeMsg);
                }
            } else {
                noticeMsg.addField("Can't Cut Trees", "This can only be used in a forest, find one on the `!map`!");
                return msg.embed(noticeMsg);
            }
        } else {
            noticeMsg.addField("Can't Cut Trees", "You haven't unlocked woodcutting yet, try asking around in Dragonstone Village!");
            return msg.embed(noticeMsg);
        }
    };
}