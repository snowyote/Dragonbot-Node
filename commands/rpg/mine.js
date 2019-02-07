const {
    Command
} = require('discord.js-commando');
const Utils = require('../../core/utils.js');
const Discord = require('discord.js');

module.exports = class MineCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'mine',
            group: 'rpg',
            memberName: 'mine',
            description: 'Mine to gain resources',
            examples: ['mine'],
			throttling: {
				usages: 1,
				duration: 10
			}
        });
    }

    async run(msg) {
		const noticeMsg = new Discord.RichEmbed()
            .setAuthor("World of the House of Dragons", "https://i.imgur.com/CyAb3mV.png")
			.setDescription("<@"+msg.author.id+">")

		if(await Utils.canUseAction(msg.author, 'mine')) {
			let queryRes = await Utils.queryDB("SELECT * FROM users WHERE discordID=" + msg.author.id);

			Utils.log("\x1b[36m%s\x1b[0m", "DB: Selected user ID " + msg.author.id);
			var userID = queryRes[0].id;
			var active = queryRes[0].activePet;
				if(active > 0) {
					if (await Utils.hasCompletedQuest(msg.author.id, 2)) {
						if (await Utils.getLocType(msg.author) == 'quarry') {
							let petRes = await Utils.queryDB("SELECT * FROM pets WHERE id="+active);
							var staminaBoost = petRes[0].staminaBoost;
							var foodBoost = petRes[0].foodBoost;
							var battleBoost = petRes[0].battleBoost;
							var exploreBoost = petRes[0].exploreBoost;
							var trashBoost = petRes[0].trashBoost;
							var alchemyPower = petRes[0].alchemyPower;
							var petLvl = petRes[0].level;
							var isEgg = petRes[0].isEgg;
							var isSleeping = petRes[0].isSleeping;
							var sleepTime = petRes[0].sleepTime;
							var petStamina = petRes[0].stamina;
							var food = queryRes[0].food;
							if(staminaBoost == 5) staminaBoost = 10;
							if(isEgg == 0) {
								if(petStamina >= (10 - staminaBoost)) {
									if(isSleeping == 0) {
										var staminaUsed = (10 - staminaBoost);
										var foodUsed = petLvl;
										if(foodBoost > 0) foodUsed = 0;
										
										if(food >= foodUsed) {
											await Utils.queryDB("UPDATE pets SET stamina=stamina-"+staminaUsed+" WHERE id="+active);
											await Utils.queryDB("UPDATE users SET food=food-"+foodUsed+" WHERE discordID="+msg.author.id);
											Utils.log("\x1b[36m%s\x1b[0m", "DB: Used "+staminaUsed+" stamina and "+foodUsed+" food!");
											let achRes = await Utils.queryDB("SELECT * FROM achievement_progress WHERE id="+userID);
											let petRes = await Utils.queryDB("SELECT * FROM pets WHERE id="+active);
											let userRes = await Utils.queryDB("SELECT * FROM users WHERE discordID="+msg.author.id);
											petStamina = petRes[0].stamina;
											food = userRes[0].food;
											var petXP = petRes[0].exp;
											var petName = petRes[0].name;
											var petMaxStamina = petRes[0].maxStamina;
											var intelligence = petRes[0].intelligence + (petRes[0].intelBoost);
											var luck = petRes[0].luck + (petRes[0].luckBoost);
											var hunting = petRes[0].hunting + (petRes[0].huntingBoost);
											var mining = petRes[0].mining + (petRes[0].miningBoost);
											var avarice = petRes[0].avarice + petRes[0].avariceBoost;
											var dexterity = JSON.parse(petRes[0].dexterity);
											var equipList = JSON.parse(queryRes[0].equipmentList);
											var coinsGained = 0;
											var gcratesFound = 0;
											var gems = JSON.parse(queryRes[0].gems);
											var battlesWon = 0;
											var crate = JSON.parse(userRes[0].crate);
											var caveDepth = 0;
											var gemsMined = 0;
											var artifactsGained = 0;
											var expGained = 0;
											var petType = petRes[0].petType;
											
											if(equipList == "" || equipList === null) {
												equipList = new Array();
											}
											
											const items = await Utils.queryDB("SELECT * FROM items");
											
											const embedMsg = new Discord.RichEmbed()
												.setAuthor(petName+"'s Cave Spelunking", "https://i.imgur.com/CyAb3mV.png")
												.setDescription("💚 ("+petStamina+"/"+petMaxStamina+") 🍖 ("+food+")")
												.setFooter("📝 Please wait 10 seconds before mining again..")
												
											/* -----------------------------------------------------------------------
											   This section determines your random reward from exploring!
											----------------------------------------------------------------------- */

											var reward = [];
											var probability = 2.6-(Math.floor(luck/10));
											if(probability < 1.1) probability = 1.1;
											var amountOfMines = Utils.biasedRandom(1,3,(4-Math.floor(luck/10)));
											Utils.log("\x1b[36m%s\x1b[0m", "DB: Luck random: "+probability);
											var randomCheck = Utils.biasedRandom(1,4,probability);
											let rewardCheck, rewardType, rewardName, rewardMsg;
											var totalXPGain = 0;
											var varToChange = new Array();
											var valueToAdd = new Array();
											var staminaAdd = 0;
											var randomAmount = 0;
											var findMsg = "";
											for(var ex = 0; ex < amountOfMines; ex++) {
												//var randomCheck = Math.floor(Math.random() * 101);
												randomCheck = Utils.biasedRandom(1,4,probability);
												if(petRes[0].caveDepth >= 20000) randomCheck = Utils.biasedRandom(2,4,probability);
												Utils.log("\x1b[36m%s\x1b[0m", "DB: Dig");
												const explores = await Utils.queryDB("SELECT * FROM mining WHERE type = 'Dig'");
												rewardCheck = Utils.biasedRandom(0,explores.length-1,(8-(luck/10)));
												randomAmount = Utils.randomIntIn(explores[rewardCheck].amountMin+((mining+1)/10), (explores[rewardCheck].amountMax*(mining*dexterity[0]))+1);
												var waterRandom = Utils.randomIntIn(1, 100);
												var waterChance = Math.floor(petRes[0].caveDepth/5000);
												if(waterChance < 0) waterChance = 0;
												if(waterChance > 100) waterChance = 100;
												var geyserRandom = Utils.randomIntIn(1, 100);
												var caveChance = Utils.randomIntIn(0, 100);
												var geyserChance = Math.floor((Math.floor(petRes[0].caveDepth/2000))-(mining/10));
												if(geyserChance < 0) geyserChance = 0;
												if(geyserChance > 100) geyserChance = 100;
												Utils.log("\x1b[36m%s\x1b[0m", "DB: Geyser random: "+geyserRandom+", Geyser chance: "+geyserChance);
												embedMsg.setDescription("💚 ("+petStamina+"/"+petMaxStamina+") 🍖 ("+food+")"
													+"\n🌋 Geyser: **"+geyserChance+"%**"
													+"\n🕳️ Cave: **"+luck+"%**"
													+"\n🌊 Lake: **"+waterChance+"%**")
												if(geyserRandom <= geyserChance) {
													rewardType = "eruption";
													riseAmount = Utils.randomIntIn(0,0.1*petRes[0].caveDepth);
													findMsg = findMsg + "🌋 ...dug into a geyser and got blasted up **"+riseAmount+"m**!\n";
													caveDepth -= riseAmount;
												} else if(caveChance <= luck) {
													rewardType = "cave";
													findMsg = findMsg + "🕳️ ...dug into an underground cave system, falling **"+randomAmount*2+"m**!\n";
													caveDepth += randomAmount*2;
												} else if(waterRandom <= waterChance) {
													rewardType = "water";
													caveDepth += randomAmount;
													randomAmount = Math.ceil(randomAmount * 0.3);
													findMsg = findMsg + "🌊 ...was slowed down by an underground lake, digging **"+randomAmount+"m**!\n";
												} else {
													rewardType = "dig";
													caveDepth += randomAmount;
													findMsg = findMsg + explores[0].icon+" ...dug down **"+randomAmount+"m**!\n";
												}
												
												var multiplier = 1;
												var start = 0;
												if(petRes[0].caveDepth >= 10000) multiplier = 2;
												if(petRes[0].caveDepth >= 20000) {
													multiplier = 3;
													start = 1;
												}
												if(petRes[0].caveDepth >= 40000) {
													multiplier = 4;
													start = 2;
												}
												if(petRes[0].caveDepth >= 75000) {
													multiplier = 5;
													start = 3;
												}
												
												if(randomCheck == 1) {
													Utils.log("\x1b[36m%s\x1b[0m", "DB: Trash");
													const explores = await Utils.queryDB("SELECT * FROM mining WHERE type = 'Trash'");
													rewardCheck = Utils.biasedRandom(start,explores.length-1,(8-(luck/10)));
													if(explores[rewardCheck].depthReq <= petRes[0].caveDepth) {
														randomAmount = Utils.randomIntIn(explores[rewardCheck].amountMin, explores[rewardCheck].amountMax)*multiplier;
														if(alchemyPower == 1) {
														findMsg = findMsg + explores[0].icon+" ...turned **"+randomAmount+"** trash into coins!\n";
														rewardType = "coins";
														varToChange.push("coins");
														} else {
															findMsg = findMsg + explores[0].icon+" ...found **"+randomAmount+"** buried trash!\n";
															rewardType = "trash";
															varToChange.push("trash");
														}
														valueToAdd.push(randomAmount);
													} else {
														findMsg = findMsg + explores[0].icon+" ...could see something buried, but isn't deep enough!\n";
														varToChange.push("food");
														valueToAdd.push(0);
													}
												}
												if(petRes[0].caveDepth >= 200) {
													if(randomCheck == 2) {
														Utils.log("\x1b[36m%s\x1b[0m", "DB: Gem");
														const explores = await Utils.queryDB("SELECT * FROM mining WHERE type = 'Gem'");
														rewardCheck = Utils.biasedRandom(start,explores.length-1,(8-(luck/10)));
														if(explores[rewardCheck].depthReq <= petRes[0].caveDepth) {
															randomAmount = Utils.randomIntIn(explores[rewardCheck].amountMin, explores[rewardCheck].amountMax)*multiplier;
															gemAmount = randomAmount;
															rewardType = "gem";
															varToChange.push("food");
															valueToAdd.push(0);
															var gemType = 0;
															if(petRes[0].caveDepth >= 20000 && petRes[0].caveDepth < 30000) {
																randomAmount = Math.ceil(randomAmount/2)+1
																findMsg = findMsg + explores[0].icon+" ...mined **"+randomAmount+"** chipped gem(s), and **"+gemAmount+"** gemstone shard(s)!\n";
																gemType = 1;
																gems[0] += gemAmount;
															}
															else if(petRes[0].caveDepth >= 30000 && petRes[0].caveDepth < 75000) {
																randomAmount = Math.ceil(randomAmount/3)+1
																findMsg = findMsg + explores[0].icon+" ...mined **"+randomAmount+"** flawed gem(s), and **"+gemAmount+"** gemstone shard(s)!\n";
																gemType = 2;
																gems[0] += gemAmount;
															}
															else if(petRes[0].caveDepth >= 75000 && petRes[0].caveDepth < 125000) {
																randomAmount = Math.ceil(randomAmount/5)+1
																findMsg = findMsg + explores[0].icon+" ...mined **"+randomAmount+"** flawless gem(s), and **"+gemAmount+"** gemstone shard(s)!\n";
																gemType = 3;
																gems[0] += gemAmount;
															} 
															else if(petRes[0].caveDepth >= 125000) {
																randomAmount = Math.ceil(randomAmount/10);
																findMsg = findMsg + explores[0].icon+" ...mined **"+randomAmount+"** perfect gem(s), and **"+gemAmount+"** gemstone shard(s)!\n";
																gemType = 4;
																gems[0] += gemAmount;
															} 
															else {
																findMsg = findMsg + explores[0].icon+" ...mined **"+randomAmount+"** gemstone shard(s)!\n";
															}
															gems[gemType] += randomAmount;
														} else {
															findMsg = findMsg + explores[0].icon+" ...could see something sparkling, but isn't deep enough!\n";
															varToChange.push("food");
															valueToAdd.push(0);
														}
													}
													else if(randomCheck == 3) {
														Utils.log("\x1b[36m%s\x1b[0m", "DB: Artifacts");
														const explores = await Utils.queryDB("SELECT * FROM mining WHERE type = 'Artifact'");
														rewardCheck = Utils.biasedRandom(start,explores.length-1,(8-(luck/10)));
														if(explores[rewardCheck].depthReq <= petRes[0].caveDepth) {
															randomAmount = Utils.randomIntIn(explores[rewardCheck].amountMin, explores[rewardCheck].amountMax)*multiplier;
															findMsg = findMsg + explores[0].icon+" ...found **"+randomAmount+"** ancient artifact(s)!\n";
															rewardType = "artifact";
															varToChange.push("artifacts");
															artifactsGained += randomAmount;
															valueToAdd.push(randomAmount);
														} else {
															findMsg = findMsg + explores[0].icon+" ...could see something strange, but isn't deep enough!\n";
															varToChange.push("food");
															valueToAdd.push(0);
														}
													}
													else if(randomCheck == 4) {
														Utils.log("\x1b[36m%s\x1b[0m", "DB: Treasure");
														const explores = await Utils.queryDB("SELECT * FROM mining WHERE type = 'Treasure'");
														rewardCheck = Utils.biasedRandom(0,explores.length-1,(8-(luck/10)));
														if(explores[rewardCheck].depthReq <= petRes[0].caveDepth) {
															randomAmount = Utils.randomIntIn(explores[rewardCheck].amountMin, explores[rewardCheck].amountMax)*multiplier;
															var cmsg = "coin(s)";
															if(explores[rewardCheck].varToChange == "crate" && explores[rewardCheck].equipID == 0) {
																cmsg = "Wooden Crate(s)";
																crate[explores[rewardCheck].equipID] += randomAmount;
																varToChange.push("food");
																valueToAdd.push(0);
															}
															else if(explores[rewardCheck].varToChange == "crate" && explores[rewardCheck].equipID == 2) {
																cmsg = "Golden Crate(s)";
																gcratesFound += randomAmount;
																crate[explores[rewardCheck].equipID] += randomAmount;
																varToChange.push("food");
																valueToAdd.push(0);
															} else {
																findMsg = findMsg + explores[0].icon+" ...found **"+randomAmount+"** "+cmsg+"!\n";
																rewardType = "coins";
																varToChange.push("coins");
																coinsGained += randomAmount;
																valueToAdd.push(randomAmount);
															}
														} else {
															findMsg = findMsg + explores[0].icon+" ...could see something shiny, but isn't deep enough!\n";
															varToChange.push("food");
															valueToAdd.push(0);
														}
													}
												} else {
													varToChange.push("food");
													valueToAdd.push(0);
												}
											}
											
											if(petRes[0].caveDepth >= 75000) {
												randomAmount = Math.ceil(Utils.randomIntIn(100,1000)*avarice);
												findMsg = findMsg + "💰"+" ...found some precious metals, selling for **"+randomAmount+"** coins!\n";
												varToChange.push("coins");
												valueToAdd.push(randomAmount);
											}
											
											findMsg = findMsg.slice(0, -1);
											var km = ((petRes[0].caveDepth+caveDepth)/1000).toFixed(2);
											embedMsg.addField("At cave depth **"+km+"km**, "+petName+"...", findMsg);

											/* -----------------------------------------------------------------------
											   This section calculates XP bonuses and progress towards levelling!
											----------------------------------------------------------------------- */

											var rs = new Utils.RSExp();
											
											// Generate normal EXP

											var xpFromReward = Utils.randomIntIn((intelligence*5)+1,(intelligence*20)+50);

											// Bonus from chance + intelligence stat

											var bonus = (randomCheck*petLvl) + (petLvl*5) + (Utils.randomIntIn(petRes[0].caveDepth, petRes[0].caveDepth*2));
											
											var levelXP = rs.level_to_xp(petLvl)/100;
											if(petLvl > 100) levelXP = rs.level_to_xp(petLvl)/10000;
											if(petLvl > 200) levelXP = rs.level_to_xp(petLvl)/1000000;
											if(petLvl > 300) levelXP = rs.level_to_xp(petLvl)/1000000000;
											if(petLvl > 400) levelXP = rs.level_to_xp(petLvl)/10000000000;
											levelXP = Utils.randomIntIn(petLvl, levelXP);

											totalXPGain += bonus+xpFromReward+levelXP;

											var intelPercent = 0;
											if(intelligence > 0) {
												intelPercent = intelligence*5;
												totalXPGain = totalXPGain + (totalXPGain / intelPercent)
											}
											
											// Level bonus
											if(totalXPGain > 1000000) totalXPGain = 1000000;

											expGained = totalXPGain;

											// Calculating level progress from RuneScape algorithm
											var newXP = Math.floor(petXP + totalXPGain);
											var newLvl = petLvl;
											var newSP = 0;

											while(newXP >= rs.level_to_xp(newLvl+1)) {
											newXP -= rs.level_to_xp(petLvl+1);
											newLvl += 1;
											}
											
											let minSkillXP = Math.round(Math.sqrt((Math.sqrt(dexterity[0])*0.25)*Utils.randomIntIn(5, 10) / 2)); 
											let maxSkillXP = Math.round(Math.sqrt((Math.sqrt(dexterity[0])*0.25)*Utils.randomIntIn(10, 15+(intelligence/10)) / 2));
											let skillIntel = 0;
											let skillXP = Utils.randomIntIn(minSkillXP, maxSkillXP); 
											if(intelligence > 0) {
												skillIntel = (intelligence/5);
												skillXP = skillXP+(skillXP/skillIntel);
											}
											dexterity[1] += skillXP;
											var dexGained = 0;
											
											while(dexterity[1] >= rs.level_to_xp(dexterity[0]+1)) {
											dexterity[1] -= rs.level_to_xp(dexterity[0]+1);
											dexterity[0] += 1;
											dexGained++;
											}

											var neededXP = rs.level_to_xp(newLvl+1);

											embedMsg.addField("XP Gains",
												"[Lv."+newLvl+"] **Affection:** +"+Math.floor(totalXPGain)+"xp ("+intelPercent+"% Intelligence Bonus)\n*Progress:* ["+Utils.drawXPBar(neededXP, newXP)+"]\n"+
												"[Lv."+dexterity[0]+"] **Dexterity:** +"+Math.floor(skillXP)+"xp ("+skillIntel+"% Intelligence Bonus)\n*Progress:* ["+Utils.drawXPBar(rs.level_to_xp(dexterity[0]+1), dexterity[1])+"]\n");

											// If levelled up at all...

											if(newLvl > petLvl) {
												embedMsg.addField("Affection Up",petName+" levelled up and is now affection level "+(newLvl)+"!");
												newSP = (newLvl - petLvl);
											}

											if(dexGained > 0) {
												embedMsg.addField("Dexterity Up",petName+" levelled up and is now dexterity level "+(dexterity[0])+"!");
											}

											/* -----------------------------------------------------------------------
											   Final section - sends the message!
											----------------------------------------------------------------------- */
											
											await Utils.queryDB("UPDATE pets SET exp="+newXP+", dexterity='"+JSON.stringify(dexterity)+"', level="+newLvl+", skillPoints=skillPoints+"+newSP+", stamina=stamina+"+staminaAdd+" WHERE id="+active);
											await Utils.queryDB("UPDATE achievement_progress SET gemsMined=gemsMined+"+gemsMined+", caveDepth=caveDepth+"+caveDepth+", artifactsGained=artifactsGained+"+artifactsGained+", foodUsed=foodUsed+"+foodUsed+", staminaUsed=staminaUsed+"+staminaUsed+", exploreNum=exploreNum+"+amountOfMines+", coinsGained=coinsGained+"+coinsGained+", gcratesFound=gcratesFound+"+gcratesFound+", expGained=expGained+"+expGained+", battlesWon=battlesWon+"+battlesWon+" WHERE id="+userID);
											for(var up = 0; up < amountOfMines; up++) await Utils.queryDB("UPDATE pets SET caveDepth=caveDepth+"+caveDepth+" WHERE id="+active);
											for(var up = 0; up < amountOfMines; up++) await Utils.queryDB("UPDATE users SET "+varToChange[up]+"="+varToChange[up]+"+"+valueToAdd[up]+", gems='"+JSON.stringify(gems)+"' WHERE discordID="+msg.author.id);
											
											return msg.embed(embedMsg);
										} else {
											noticeMsg.addField("Can't Mine", "Your pet is begging for food and won't mine, buy some more with `!market`!");
											return msg.embed(noticeMsg);
										}
									} else {
										noticeMsg.addField("Can't Mine", "This pet is currently sleeping and will wake up in **"+Utils.formatTimeUntil(sleepTime)+"**!");
										return msg.embed(noticeMsg);
									}
								} else {
									noticeMsg.addField("Can't Mine", "No stamina, use `!sleep` to recover!");
									return msg.embed(noticeMsg);
								}
							} else {
								noticeMsg.addField("Can't Mine", "Your current pet's not hatched yet, use `!hatch` to check up on it!");
								return msg.embed(noticeMsg);
							}		
						} else {
							noticeMsg.addField("Can't Mine", "This can only be done in the quarry, find it on the `!map`!");
							return msg.embed(noticeMsg);
						}	
					} else {
						noticeMsg.addField("Can't Mine", "You haven't unlocked mining yet, try asking around in the Dragonstone Quarry!");
						return msg.embed(noticeMsg);
					}				
				} else {
					noticeMsg.addField("Can't Mine", "You don't have any pets to mine with, use `!adopt` to get one!");
					return msg.embed(noticeMsg);
				}
		} else {
			noticeMsg.addField("Can't Mine", "This can only be done in the quarry, find it on the `!map`!");
			return msg.embed(noticeMsg);
		}
    };
}