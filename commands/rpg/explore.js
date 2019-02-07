const {
    Command
} = require('discord.js-commando');
const Utils = require('../../core/utils.js');
const Discord = require('discord.js');

module.exports = class ExploreCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'explore',
            group: 'rpg',
            memberName: 'explore',
            description: 'Explore to gain resources',
            examples: ['explore'],
			throttling: {
				usages: 1,
				duration: 10
			}
        });
    }

    async run(msg) {
		var msgAction = "Found while exploring...";

        const noticeMsg = new Discord.RichEmbed()
            .setAuthor("House of Dragons Notice", "https://i.imgur.com/CyAb3mV.png")
			.setDescription("<@"+msg.author.id+">")

        let queryRes = await Utils.queryDB("SELECT * FROM users WHERE discordID=" + msg.author.id);

        Utils.log("\x1b[36m%s\x1b[0m", "DB: Selected user ID " + msg.author.id);
		var userID = queryRes[0].id;
		var active = queryRes[0].activePet;
		if(msg.channel.id == "533381330675957766") {
			if(active > 0) {
				let petRes = await Utils.queryDB("SELECT * FROM pets WHERE id="+active);
				var staminaBoost = petRes[0].staminaBoost;
				var foodBoost = petRes[0].foodBoost;
				var battleBoost = petRes[0].battleBoost;
				var exploreBoost = petRes[0].exploreBoost;
				var trashBoost = petRes[0].trashBoost;
				var alchemyPower = petRes[0].alchemyPower;
				var petLvl = petRes[0].level;
				var hasRiver = 0;
				var density = 1;
				var hasRuins = 0;
				var isEgg = petRes[0].isEgg;
				var isSleeping = petRes[0].isSleeping;
				var sleepTime = petRes[0].sleepTime;
				var petStamina = petRes[0].stamina;
				var food = queryRes[0].food;
				if(isEgg == 0) {
					if(petStamina >= (5 - staminaBoost)) {
						if(isSleeping == 0) {
							var staminaUsed = (5 - staminaBoost);
							var foodUsed = petLvl;
							if(foodBoost > 0) foodUsed = 0;
							
							if(food >= foodUsed) {
								var locationType = await Utils.getLocType(msg.author);
								var locationName = await Utils.getLocName(msg.author);
								var possibleRewards = new Array();
								
								var trashMsg = "went to a junkyard and found";
								var foodMsg = "went hunting and got";
								
								switch(locationType) {
									case 'town':
										possibleRewards.push('nothing', 'trash', 'coins', 'quest');
										trashMsg = "looked through some villager's garbage and found";
										break;
									case 'desert':
										possibleRewards.push('nothing', 'trash', 'coins', 'quest');
										trashMsg = "sifted through some sand and found";
										break;
									case 'water':
										possibleRewards.push('nothing', 'trash', 'battle', 'food', 'coins', 'item', 'crates', 'quest');
										trashMsg = "threw a net in the water and recovered";
										foodMsg = "went spear fishing, gaining";
										break;
									case 'plains':
										possibleRewards.push('nothing', 'trash', 'battle', 'stamina', 'item', 'crates', 'keys', 'caves', 'quest');
										trashMsg = "found a dumping ground containing";
										break;
									case 'forest':
										possibleRewards.push('nothing', 'battle', 'stamina', 'food', 'coins', 'quest', 'item', 'keys', 'crates', 'artifacts', 'quest');
										foodMsg = "hunted an animal in the forest, gaining";
										break;
								}
								
								if(possibleRewards.length > 0) {	
									await Utils.queryDB("UPDATE pets SET stamina=stamina-"+staminaUsed+" WHERE id="+active);
									await Utils.queryDB("UPDATE users SET food=food-"+foodUsed+" WHERE discordID="+msg.author.id);
									Utils.log("\x1b[36m%s\x1b[0m", "DB: Used "+staminaUsed+" stamina and "+foodUsed+" food!\nDB: "+possibleRewards.length+" possible rewards!");
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
									var equipList = JSON.parse(queryRes[0].equipmentList);
									var crates = JSON.parse(queryRes[0].crate);
									var survival = JSON.parse(petRes[0].survival);
									var coinsGained = 0;
									var gcratesFound = 0;
									var battlesWon = 0;
									var artifactsGained = 0;
									var expGained = 0;
									var petType = petRes[0].petType;
									
									if(equipList == "" || equipList === null) {
										equipList = new Array();
									}
									
									const items = await Utils.queryDB("SELECT * FROM items");
									
									const embedMsg = new Discord.RichEmbed()
										.setAuthor(petName+"'s Adventure in "+locationName, "https://i.imgur.com/CyAb3mV.png")
										.setDescription("💚 ("+petStamina+"/"+petMaxStamina+") 🍖 ("+food+")")
										.setFooter("📝 Please wait 10 seconds before exploring again..")
										
									/* -----------------------------------------------------------------------
									   This section determines your random reward from exploring!
									----------------------------------------------------------------------- */

									var reward = [];
									var probability = 4-(Math.floor(luck/10));
									if(probability < 1.5) probability = 1.5;
									var amountOfExplores = Utils.biasedRandom(1,5,(4-Math.floor(luck/10)));
									var survivalBonus = survival[0]-1;
									if(survivalBonus > 3) survivalBonus = 3;
									if(exploreBoost == 1) amountOfExplores = 5;
									amountOfExplores += survivalBonus;
									Utils.log("\x1b[36m%s\x1b[0m", "DB: Luck random: "+probability);								
									var randomCheck = Utils.biasedRandom(0,possibleRewards.length-1,probability);
									
									let rewardCheck, rewardType, rewardName, rewardMsg;
									var totalXPGain = 0;
									var varToChange = new Array();
									var valueToAdd = new Array();
									var staminaAdd = 0;
									var randomAmount = 0;
									var findMsg = "";
									for(var ex = 0; ex < amountOfExplores; ex++) {
										randomCheck = Utils.biasedRandom(0,possibleRewards.length-1,probability);
										
										if(possibleRewards[randomCheck] == 'trash' && alchemyPower == 1) possibleRewards[randomCheck] = 'coins';
										
										if(possibleRewards[randomCheck] == 'nothing') {
											Utils.log("\x1b[36m%s\x1b[0m", "DB: Nothing");
											const explores = await Utils.queryDB("SELECT * FROM exploration WHERE type = 'Nothing'");
											findMsg = findMsg + explores[0].icon+" ...found nothing!\n";
											rewardType = "nothing";
											varToChange.push("food");
											valueToAdd.push(0);
										}
										else if(possibleRewards[randomCheck] == 'trash') {
											Utils.log("\x1b[36m%s\x1b[0m", "DB: Trash");
											const explores = await Utils.queryDB("SELECT * FROM exploration WHERE type = 'Trash'");
											rewardCheck = Utils.biasedRandom(0,explores.length-1,(8-(luck/10)));
											randomAmount = Utils.randomIntIn(explores[rewardCheck].amountMin, explores[rewardCheck].amountMax);
											if(trashBoost == 1) randomAmount = randomAmount*10;
											findMsg = findMsg + explores[rewardCheck].icon+" ..."+trashMsg+" **"+randomAmount+"** trash!\n";
											varToChange.push("trash");
											valueToAdd.push(randomAmount);
										}
										else if(possibleRewards[randomCheck] == 'food') {
											Utils.log("\x1b[36m%s\x1b[0m", "DB: Food");
											const explores = await Utils.queryDB("SELECT * FROM exploration WHERE type = 'Food'");
											rewardCheck = Utils.biasedRandom(0,explores.length-1,(8-(luck/10)));
											randomAmount = Utils.randomIntIn(explores[rewardCheck].amountMin, explores[rewardCheck].amountMax);
											if(hunting > 0) randomAmount = randomAmount*(hunting+1);
											findMsg = findMsg + explores[rewardCheck].icon+" ..."+foodMsg+" **"+randomAmount+"** food!\n";
											varToChange.push("food");
											valueToAdd.push(randomAmount);
										}
										else if(possibleRewards[randomCheck] == 'stamina') {
											Utils.log("\x1b[36m%s\x1b[0m", "DB: Stamina");
											const explores = await Utils.queryDB("SELECT * FROM exploration WHERE type = 'Stamina'");
											rewardCheck = Utils.biasedRandom(0,explores.length-1,(8-(luck/10)));
											if(petStamina < (petStamina/10)) {
												randomAmount = Utils.randomIntIn(explores[rewardCheck].amountMin, explores[rewardCheck].amountMax);
												findMsg = findMsg + explores[rewardCheck].icon+" ...found some fruit, gaining **"+randomAmount+"** stamina!\n";
												staminaAdd += randomAmount;
												varToChange.push("food");
												valueToAdd.push(0);
											} else {
												findMsg = findMsg + explores[rewardCheck].icon+" ...found some fruit, but decided against eating it!\n";
												varToChange.push("crates");
												valueToAdd.push(0);
											}
										}
										else if(possibleRewards[randomCheck] == 'coins') {
											Utils.log("\x1b[36m%s\x1b[0m", "DB: Coins");
											const explores = await Utils.queryDB("SELECT * FROM exploration WHERE type = 'Coins'");
											rewardCheck = Utils.biasedRandom(0,explores.length-1,(8-(luck/10)));
											randomAmount = Utils.randomIntIn(explores[rewardCheck].amountMin, explores[rewardCheck].amountMax)*(avarice+1);
											findMsg = findMsg + explores[rewardCheck].icon+" ...found a bag with **"+randomAmount+"** coins inside!\n";
											coinsGained += randomAmount;
											varToChange.push("coins");
											valueToAdd.push(randomAmount);
										}
										else if(possibleRewards[randomCheck] == 'item') {
											Utils.log("\x1b[36m%s\x1b[0m", "DB: Item");
											const items = await Utils.queryDB("SELECT * FROM items WHERE canFind = 1");
											rewardCheck = Utils.randomIntEx(0, items.length);
											let rewardLvl = items[rewardCheck].minLevel;
											while(petLvl < rewardLvl) {
												rewardCheck = Utils.randomIntEx(0, items.length);
												Utils.log("\x1b[36m%s\x1b[0m", "DB: Re-rolling item reward.. "+rewardCheck);
												rewardLvl = items[rewardCheck].minLevel;
											}
											if(equipList.includes(items[rewardCheck].id)) {
												findMsg = findMsg + items[rewardCheck].icon+" ...got confused and gave you one of your own items!\n";
												varToChange.push("coins");
												coinsGained += parseInt(items[rewardCheck].value);
												valueToAdd.push(parseInt(items[rewardCheck].value));		
											} else {
												findMsg = findMsg + items[rewardCheck].icon+" ...found **"+items[rewardCheck].name+"** (Equipment)!\n";
												var eID = items[rewardCheck].id;
												equipList.push(eID);
												varToChange.push("food");
												valueToAdd.push(0);
											}
											rewardType = "item";
										}
										else if(possibleRewards[randomCheck] == 'quest') {
											Utils.log("\x1b[36m%s\x1b[0m", "DB: Quest Item ("+locationType+")");
											const itemsQuest = await Utils.queryDB("SELECT * FROM quest_items WHERE locationType='"+locationType+"'");
											varToChange.push("food");
											valueToAdd.push(0);
											if(itemsQuest && itemsQuest.length) {
												rewardCheck = Utils.randomIntEx(0, itemsQuest.length);
												if(await Utils.hasQuestItem(msg.author.id, rewardCheck+1)) {
													findMsg = findMsg + itemsQuest[rewardCheck].icon+" ...got confused and gave you one of your own items!\n";
												} else {
													if(await Utils.isInQuest(msg.author) == itemsQuest[rewardCheck].questID) {
														findMsg = findMsg + itemsQuest[rewardCheck].icon+" ...found **"+itemsQuest[rewardCheck].name+"** (Quest Item)!\n";
														await Utils.addQuestItem(msg.author.id, rewardCheck+1);
													} else {
														findMsg = findMsg + itemsQuest[rewardCheck].icon+" ...left something that belongs to someone else!\n";
													}
												}
											} else {
												findMsg = findMsg + "🤦 ...couldn't find anything useful!\n";
											}
										}
										else if(possibleRewards[randomCheck] == 'battle') {
											Utils.log("\x1b[36m%s\x1b[0m", "DB: Battle");
											const explores = await Utils.queryDB("SELECT * FROM exploration WHERE type = 'Battle'");
											const monsters = await Utils.queryDB("SELECT * FROM monsters");
											rewardCheck = Utils.biasedRandom(0,explores.length-1,(8-(luck/10)));
											let randomMonster = Utils.randomIntEx(0,monsters.length);
											
											// win or lose?
											var battleChance = Math.round(Math.random());
											if(battleBoost > 0) battleChance = 1;
											var battleResult = "none", monsterName = "none", monsterCR = 0, monsterEXP = 0;
											
											monsterName = monsters[randomMonster].name;
											monsterCR = monsters[randomMonster].cr;
											monsterEXP = monsterCR * 1000;
											if(battleChance == 0) {
												battleResult = " ...got scared and ran away from a **"+monsterName+"**!";
											} else {
												battleResult = " ...bravely defeated a **"+monsterName+"**! (**"+monsterEXP+" XP**)";		
												totalXPGain += (monsterCR*1000);
												battlesWon += 1;
											}
											findMsg = findMsg + explores[rewardCheck].icon+" "+battleResult+"\n";
											rewardType = "battle";
											varToChange.push("food");
											valueToAdd.push(0);
										}
										else if(possibleRewards[randomCheck] == 'keys') {
											Utils.log("\x1b[36m%s\x1b[0m", "DB: Keys");
											const explores = await Utils.queryDB("SELECT * FROM exploration WHERE type = 'Key'");
											rewardCheck = Utils.biasedRandom(0,explores.length-1,(8-(luck/10)));
											randomAmount = Utils.randomIntIn(explores[rewardCheck].amountMin, explores[rewardCheck].amountMax);
											findMsg = findMsg + explores[rewardCheck].icon+" ...found **"+randomAmount+"** key(s)!\n";
											varToChange.push("crateKeys");
											valueToAdd.push(randomAmount);
										}
										else if(possibleRewards[randomCheck] == 'crates') {
											Utils.log("\x1b[36m%s\x1b[0m", "DB: Crates");
											const explores = await Utils.queryDB("SELECT * FROM exploration WHERE type = 'Crate'");
											rewardCheck = Utils.biasedRandom(0,explores.length-1,(8-(luck/10)));
											randomAmount = Utils.randomIntIn(explores[rewardCheck].amountMin, explores[rewardCheck].amountMax);
											var crateType = explores[rewardCheck].varToChange.split("-");
											const crateTypes = await Utils.queryDB("SELECT * FROM crate_types WHERE `index` = "+parseInt(crateType[1]));
											crates[parseInt(crateType[1])] += randomAmount;
											findMsg = findMsg + explores[rewardCheck].icon+" ...found **"+randomAmount+"** "+crateTypes[0].name+"(s)!\n";
											varToChange.push("food");
											valueToAdd.push(0);
										}
										else if(possibleRewards[randomCheck] == 'artifacts') {
											Utils.log("\x1b[36m%s\x1b[0m", "DB: Artifact");
											const explores = await Utils.queryDB("SELECT * FROM exploration WHERE type = 'Artifact'");
											rewardCheck = Utils.biasedRandom(0,explores.length-1,(8-(luck/10)));
											randomAmount = Utils.randomIntIn(explores[rewardCheck].amountMin, explores[rewardCheck].amountMax);
											findMsg = findMsg + explores[rewardCheck].icon+" ...found **"+randomAmount+"** ancient artifact(s)!\n";
											varToChange.push("artifacts");
											artifactsGained += randomAmount;
											valueToAdd.push(randomAmount);
										}
										else if(possibleRewards[randomCheck] == 'caves') {
											Utils.log("\x1b[36m%s\x1b[0m", "DB: Caving");
											const explores = await Utils.queryDB("SELECT * FROM exploration WHERE type = 'Caving'");
											rewardCheck = Utils.biasedRandom(0,explores.length-1,(8-(luck/10)));
											randomAmount = Utils.randomIntIn(explores[rewardCheck].amountMin, explores[rewardCheck].amountMax);
											var dbVar = explores[rewardCheck].varToChange;
											var cmsg = "food";
											if(dbVar == "crates") cmsg = "crate(s)";
											if(dbVar == "artifacts") {
												cmsg = "ancient artifact(s)";
												artifactsGained += randomAmount;
											}
											if(dbVar == "coins") {
												cmsg = "coins";
												coinsGained += randomAmount;
											}
											findMsg = findMsg + explores[rewardCheck].icon+" ...found a cave with **"+randomAmount+"** "+cmsg+"!\n";
											varToChange.push(dbVar);
											valueToAdd.push(randomAmount);
										}
										else if(possibleRewards[randomCheck] == 'orbs') {
											Utils.log("\x1b[36m%s\x1b[0m", "DB: Mystic Orbs");
											var orbCheck = Utils.randomIntIn(1,100)
											const explores = await Utils.queryDB("SELECT * FROM exploration WHERE type = 'Mystic Orb'");
											if(orbCheck <= 25) {
												rewardCheck = Utils.biasedRandom(0,explores.length-1,(8-(luck/10)));
												randomAmount = Utils.randomIntIn(explores[rewardCheck].amountMin, explores[rewardCheck].amountMax);
												findMsg = findMsg + explores[rewardCheck].icon+" ...found **"+randomAmount+"** mystic orb(s)!\n";
												varToChange.push("mysticOrbs");
												valueToAdd.push(randomAmount);
											} else {
												varToChange.push("crates");
												valueToAdd.push(0);
											}
										}
										else if(possibleRewards[randomCheck] == 'gcrates') {
											Utils.log("\x1b[36m%s\x1b[0m", "DB: Golden Crates");
											var gcrateCheck = Utils.randomIntIn(1,100);
											const explores = await Utils.queryDB("SELECT * FROM exploration WHERE type = 'Golden Crate'");
											rewardCheck = Utils.biasedRandom(0,explores.length-1,(8-(luck/10)));
											randomAmount = 1;
											if(gcrateCheck <= 10) {
												findMsg = findMsg + explores[rewardCheck].icon+" ...got lucky and found **"+randomAmount+"** golden crate(s)!\n";
												crates[2] += randomAmount;
												gcratesFound++;
												varToChange.push("food");
												valueToAdd.push(0);
											} else {
												findMsg = findMsg + explores[rewardCheck].icon+" ...accidentally broke a golden crate!\n";
												varToChange.push("crates");
												valueToAdd.push(0);
											}
										}
									}
									
									findMsg = findMsg.slice(0, -1);
									embedMsg.addField("While exploring, "+petName+"...", findMsg);
									//await embedMsg.setImage("http://www.gozzys.com/wilderness-maps/make?seed="+makeid()+"&mapsize=1&density="+density+"&stream="+hasRiver+"&ruins="+hasRuins+"&pathyn=0&grid=0");

									/* -----------------------------------------------------------------------
									   This section calculates XP bonuses and progress towards levelling!
									----------------------------------------------------------------------- */

									var rs = new Utils.RSExp();
									
									// Generate normal EXP

									var xpFromReward = Utils.randomIntIn((intelligence*5)+1,(intelligence*20)+50);

									// Bonus from chance + intelligence stat

									var bonus = (randomCheck*petLvl) + (petLvl*5);
									
									var levelXP = rs.level_to_xp(petLvl)/100;
									if(petLvl > 100) levelXP = rs.level_to_xp(petLvl)/10000;
									if(petLvl > 200) levelXP = rs.level_to_xp(petLvl)/1000000;
									if(petLvl > 300) levelXP = rs.level_to_xp(petLvl)/1000000000;
									if(petLvl > 400) levelXP = rs.level_to_xp(petLvl)/10000000000;
									levelXP = Utils.randomIntIn(petLvl, levelXP);

									totalXPGain += bonus+xpFromReward+levelXP;
									var intelPercent = 0;
									if(intelligence > 0) {
										intelPercent = Math.ceil(intelligence*5);
										totalXPGain = totalXPGain + (totalXPGain/intelPercent);
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

									var neededXP = rs.level_to_xp(newLvl+1);
									
									let minSkillXP = Math.round(Math.sqrt((Math.sqrt(survival[0])*0.25)*Utils.randomIntIn(5, 10) / 2)); 
									let maxSkillXP = Math.round(Math.sqrt((Math.sqrt(survival[0])*0.25)*Utils.randomIntIn(10, 15) / 2));
									let skillIntel = 0;
									let skillXP = Utils.randomIntIn(minSkillXP, maxSkillXP); 
									if(intelligence > 0) {
										skillIntel = (intelligence/5);
										skillXP = skillXP+(skillXP/skillIntel);
									}
									survival[1] += skillXP;
									var survivalLevels = 0;
									
									while(survival[1] >= rs.level_to_xp(survival[0]+1)) {
									survival[1] -= rs.level_to_xp(survival[0]+1);
									survival[0] += 1;
									survivalLevels++;
									}

									embedMsg.addField("XP Gains",
										"[Lv."+newLvl+"] **Affection:** +"+Math.floor(totalXPGain)+"xp ("+intelPercent+"% Intelligence Bonus)\n*Progress:* ["+Utils.drawXPBar(neededXP, newXP)+"]\n"+
										"[Lv."+survival[0]+"] **Survival:** +"+Math.floor(skillXP)+"xp ("+skillIntel+"% Intelligence Bonus)\n*Progress:* ["+Utils.drawXPBar(rs.level_to_xp(survival[0]+1), survival[1])+"]\n");

									// If levelled up at all...

									if(newLvl > petLvl) {
										embedMsg.addField("Affection Up",petName+" levelled up and is now affection level "+(newLvl)+"!");
										newSP = (newLvl - petLvl);
									}

									if(survivalLevels > 0) {
										embedMsg.addField("Survival Up",petName+" levelled up and is now survival level "+(survival[0])+"!");
									}

									/* -----------------------------------------------------------------------
									   Final section - sends the message!
									----------------------------------------------------------------------- */
									
									await Utils.queryDB("UPDATE pets SET exp="+newXP+", survival='"+JSON.stringify(survival)+"', level="+newLvl+", skillPoints=skillPoints+"+newSP+", stamina=stamina+"+staminaAdd+" WHERE id="+active);
									await Utils.queryDB("UPDATE achievement_progress SET artifactsGained=artifactsGained+"+artifactsGained+", foodUsed=foodUsed+"+foodUsed+", staminaUsed=staminaUsed+"+staminaUsed+", exploreNum=exploreNum+"+amountOfExplores+", coinsGained=coinsGained+"+coinsGained+", gcratesFound=gcratesFound+"+gcratesFound+", expGained=expGained+"+expGained+", battlesWon=battlesWon+"+battlesWon+" WHERE id="+userID);
									for(var up = 0; up < amountOfExplores; up++) await Utils.queryDB("UPDATE users SET crate='"+JSON.stringify(crates)+"', equipmentList='"+JSON.stringify(equipList)+"', "+varToChange[up]+"="+varToChange[up]+"+"+parseInt(valueToAdd[up])+" WHERE discordID="+msg.author.id);
									
									return msg.embed(embedMsg);
								} else {
									noticeMsg.addField("Can't Explore", "You can't explore in this location!");
									return msg.embed(noticeMsg);
								}
							} else {
								noticeMsg.addField("Can't Explore", "Your pet is begging for food and won't explore, buy some more with `!market`!");
								return msg.embed(noticeMsg);
							}
						} else {
							noticeMsg.addField("Can't Explore", "This pet is currently sleeping and will wake up in **"+Utils.formatTimeUntil(sleepTime)+"**!");
							return msg.embed(noticeMsg);
						}
					} else {
						noticeMsg.addField("Can't Explore", "No stamina, use `!sleep` to recover!");
						return msg.embed(noticeMsg);
					}
				} else {
					noticeMsg.addField("Can't Explore", "Your current pet's not hatched yet, use `!hatch` to check up on it!");
					return msg.embed(noticeMsg);
				}			
			} else {
				noticeMsg.addField("Can't Explore", "You don't have any pets to explore with, use `!adopt` to get one!");
				return msg.embed(noticeMsg);
			}
		} else {
			noticeMsg.addField("Can't Explore", "This can only be used in the exploration channel!");
			return msg.embed(noticeMsg);
		}
    };
}