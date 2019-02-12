const {
    Command
} = require('discord.js-commando');
const Utils = require('../../core/utils.js');
const Discord = require('discord.js');

module.exports = class EquipCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'equip',
            group: 'rpg',
            memberName: 'equip',
            description: 'Equip an item!',
            examples: ['equip <type> <id>'],
            args: [{
                    key: 'type',
                    prompt: 'Who do you want to equip? (**user** or **pet**)',
                    type: 'string',
                    oneOf: ['user', 'pet']
                },
                {
                    key: 'id',
                    prompt: 'Which item do you want to equip?',
                    type: 'integer',
                    default: ''
                }
            ]
        });
    }

    async run(msg, {
        type,
        id
    }) {
        const embedMsg = new Discord.RichEmbed()
            .setAuthor("House of Dragons Notice", "https://i.imgur.com/CyAb3mV.png")
            .setDescription("<@" + msg.author.id + ">")

        var queryRes = await Utils.queryDB("SELECT * FROM users WHERE discordID=" + msg.author.id);
        const itemRes = await Utils.queryDB("SELECT * FROM items");

        Utils.log("\x1b[36m%s\x1b[0m", "DB: Selected user ID " + msg.author.id);
        var active = queryRes[0].activePet;
        var equipmentList = JSON.parse(queryRes[0].equipmentList);
        var userEquippedList = JSON.parse(queryRes[0].equippedList);
        var userAch = JSON.parse(queryRes[0].achievements);
        var a = queryRes[0].achievements;
        if (type == 'pet') {
            if (active > 0) {
                const petRes = await Utils.queryDB("SELECT * FROM pets WHERE id=" + active);
                var equippedList = JSON.parse(petRes[0].equippedList);
                Utils.log("\x1b[36m%s\x1b[0m", "DB: Selected pet ID " + active);
                if (petRes[0].isEgg == 0) {
                    if (equipmentList.length > 0) {
                        if (!id) {
                            var strings = new Array("", "", "", "");
                            var itemCount = itemRes.length;
                            var hasHG = 0;
                            var hasTR = 0;
                            var hasPW = 0;
                            var hasMI = 0;
                            var countHG = 0;
                            var countTR = 0;
                            var countPW = 0;
                            var countMI = 0;
                            for (var i = 0; i < equipmentList.length; i++) {
                                Utils.log("\x1b[36m%s\x1b[0m", "DB: Equipment list: " + equipmentList + " (" + (equipmentList[i] - 1) + ")");
                                var iType = itemRes[equipmentList[i] - 1].type;
                                if (iType == "Headgear") countHG++;
                                if (iType == "Trinket") countTR++;
                                if (iType == "Power") countPW++;
                                if (iType == "Misc") countMI++;

                                var itemEquipped = false;

                                if (equippedList.includes(equipmentList[i])) {
                                    itemEquipped = true;
                                }

                                var iTypeIndex = 0;
                                if (iType == "Headgear") {
                                    iTypeIndex = 0;
                                    hasHG++;
                                }
                                if (iType == "Trinket") {
                                    iTypeIndex = 1;
                                    hasTR++;
                                }
                                if (iType == "Power") {
                                    iTypeIndex = 2;
                                    hasPW++;
                                }
                                if (iType == "Misc") {
                                    iTypeIndex = 3;
                                    hasMI++;
                                }

                                if (strings[iTypeIndex].includes("None")) {
                                    strings[iTypeIndex].replace("None", "");
                                }

                                var description = " - (*" + itemRes[equipmentList[i] - 1].description + "*)";

                                if (itemEquipped) {
                                    strings[iTypeIndex] = strings[iTypeIndex] + "❗ [**" + equipmentList[i] + "**] " + itemRes[equipmentList[i] - 1].icon + " **Lvl." + itemRes[equipmentList[i] - 1].minLevel + "** ***" + itemRes[equipmentList[i] - 1].name + "***" + description + "\n";
                                } else {
                                    strings[iTypeIndex] = strings[iTypeIndex] + "❔ [**" + equipmentList[i] + "**] " + itemRes[equipmentList[i] - 1].icon + " **Lvl." + itemRes[equipmentList[i] - 1].minLevel + "** " + itemRes[equipmentList[i] - 1].name + description + "\n";
                                }
                            }

                            if (strings[0] == "") strings[0] = "None";
                            if (strings[1] == "") strings[1] = "None";
                            if (strings[2] == "") strings[2] = "None";
                            if (strings[3] == "") strings[3] = "None";
                            var hasItems = hasHG + hasTR + hasPW + hasMI;
                            var itemPercent = Math.floor((hasItems / itemCount) * 100);

                            const embedMsg2 = new Discord.RichEmbed()
                                .setAuthor("Equipment Center (" + hasItems + "/" + itemCount + ") [" + itemPercent + "%]", "https://i.imgur.com/CyAb3mV.png")
                                .setDescription("<@" + msg.author.id + ">")
                                .setColor("#FDF018")
                                .setFooter("!equip pet <number> - to equip an item!")

                            embedMsg2.addField("Headgear (" + hasHG + ")", strings[0]);
                            embedMsg2.addField("Trinkets (" + hasTR + ")", strings[1]);
                            embedMsg2.addField("Powers (" + hasPW + ")", strings[2]);
                            embedMsg2.addField("Miscellaneous (" + hasMI + ")", strings[3]);
                            return msg.embed(embedMsg2);
                        } else {
                            if (equipmentList.includes(id)) {
                                var minLevel = itemRes[id - 1].minLevel;
                                var name = itemRes[id - 1].name;
                                var type = itemRes[id - 1].type;
                                var statName = itemRes[id - 1].statName;
                                var statValue = itemRes[id - 1].statValue;
                                Utils.log("\x1b[36m%s\x1b[0m", "DB: Has item " + id + ", minlevel: " + minLevel + ", name: " + name);
                                if (petRes[0].level >= minLevel) {
                                    // Check and remove other equipped items of the same type
                                    var newArray = new Array();
                                    for (var i = 0; i < equippedList.length; i++) {
                                        if (itemRes[equippedList[i] - 1].type == type) {
                                            Utils.log("\x1b[36m%s\x1b[0m", "DB: Removing " + (equippedList[i] - 1));
                                            var statToRemove = itemRes[equippedList[i] - 1].statName;
                                            var statValueToRemove = itemRes[equippedList[i] - 1].statValue;
                                            if (statToRemove.length > 0) {
                                                await Utils.queryDB("UPDATE pets SET " + statToRemove + "=" + statToRemove + "-" + statValueToRemove + " WHERE id=" + active);
                                                Utils.log("\x1b[36m%s\x1b[0m", "DB: Removed bonuses from " + statToRemove + ": " + statValueToRemove);
                                            } else {
                                                Utils.log("\x1b[36m%s\x1b[0m", "DB: No stat bonuses to remove!");
                                            }
                                        } else {
                                            Utils.log("\x1b[36m%s\x1b[0m", "DB: Pushing " + (equippedList[i]));
                                            newArray.push((equippedList[i]));
                                        }
                                    }
                                    // Put in the new equipped item
                                    if (statName.length > 0) {
                                        await Utils.queryDB("UPDATE pets SET " + statName + "=" + statName + "+" + statValue + " WHERE id=" + active)
                                        Utils.log("\x1b[36m%s\x1b[0m", "DB: Equipped item " + name + ", added " + statValue + " to " + statName + "!");
                                    }
                                    newArray.push(id);
                                    await Utils.queryDB("UPDATE pets SET equippedList='" + JSON.stringify(newArray) + "' WHERE id=" + active);
                                    embedMsg.addField("Equipped Item", "Successfully equipped **" + name + "**! You can only have one **" + type + "** equipped, so any others have been unequipped for you!");
                                    return msg.embed(embedMsg);
                                } else {
                                    embedMsg.addField("Unable to Equip", "Your pet needs to be level **" + minLevel + "** to equip this!");
                                    return msg.embed(embedMsg);
                                }
                            } else {
                                embedMsg.addField("Unable to Equip", "You don't have that item to equip!");
                                return msg.embed(embedMsg);
                            }
                        }
                    } else {
                        embedMsg.addField("No Items", "You don't have any items to equip!");
                        return msg.embed(embedMsg);
                    }
                } else {
                    embedMsg.addField("Not Ready", "This pet hasn't been hatched yet, use `!hatch` to check up on it!");
                    return msg.embed(embedMsg);
                }
            } else {
                embedMsg.addField("No Pet", "You don't have a pet, get one using `!adopt`!");
                return msg.embed(embedMsg);
            }
        } else {
            const itemRes = await Utils.queryDB("SELECT * FROM items");
			if(!id) {
				var strings = new Array("", "", "", "", "", "");
				var itemCount = itemRes.length;
				if(equipmentList.length > 0) {
					for (var i = 0; i < equipmentList.length; i++) {
						Utils.log("\x1b[36m%s\x1b[0m", "DB: Equipment list: " + equipmentList + " (" + (equipmentList[i] - 1) + ")");
						var iType = itemRes[equipmentList[i] - 1].type;

						var itemEquipped = false;

						if (userEquippedList.includes(equipmentList[i])) {
							itemEquipped = true;
						}

						var iTypeIndex = 0;
						if (iType == "Helm") {
							iTypeIndex = 0;
							hasHG++;
						}
						else if (iType == "Chest") {
							iTypeIndex = 1;
							hasTR++;
						}
						else if (iType == "Leggings") {
							iTypeIndex = 2;
							hasPW++;
						}
						else if (iType == "Boots") {
							iTypeIndex = 3;
							hasMI++;
						}
						else if (iType == "Weapon") {
							iTypeIndex = 4;
							hasMI++;
						}
						else if (iType == "Shield") {
							iTypeIndex = 5;
							hasMI++;
						}
						else iTypeIndex = -1;

						if(iTypeIndex > -1) {
							if (strings[iTypeIndex].includes("None")) {
								strings[iTypeIndex].replace("None", "");
							}

							var description = " - (*" + itemRes[equipmentList[i] - 1].description + "*)";

							if (itemEquipped) {
								strings[iTypeIndex] = strings[iTypeIndex] + "❗ [**" + equipmentList[i] + "**] " + itemRes[equipmentList[i] - 1].icon + " **Lvl." + itemRes[equipmentList[i] - 1].minLevel + "** ***" + itemRes[equipmentList[i] - 1].name + "***" + description + "\n";
							} else {
								strings[iTypeIndex] = strings[iTypeIndex] + "❔ [**" + equipmentList[i] + "**] " + itemRes[equipmentList[i] - 1].icon + " **Lvl." + itemRes[equipmentList[i] - 1].minLevel + "** " + itemRes[equipmentList[i] - 1].name + description + "\n";
							}
						}
					}

					if (strings[0] == "") strings[0] = "None";
					if (strings[1] == "") strings[1] = "None";
					if (strings[2] == "") strings[2] = "None";
					if (strings[3] == "") strings[3] = "None";
					if (strings[4] == "") strings[4] = "None";
					if (strings[5] == "") strings[5] = "None";

					const embedMsg2 = new Discord.RichEmbed()
						.setAuthor("Equipment Center", "https://i.imgur.com/CyAb3mV.png")
						.setDescription("<@" + msg.author.id + ">")
						.setColor("#FDF018")
						.setFooter("!equip user <number> - to equip an item!")

					embedMsg2.addField("Helm", strings[0]);
					embedMsg2.addField("Chest", strings[1]);
					embedMsg2.addField("Leggings", strings[2]);
					embedMsg2.addField("Boots", strings[3]);
					embedMsg2.addField("Weapon", strings[4]);
					embedMsg2.addField("Shield", strings[5]);
					return msg.embed(embedMsg2);
				} else {
					embedMsg.addField("Can't Equip", "You don't have any items to equip!");
					return msg.embed(embedMsg);
				}
			} else {
				if (equipmentList.includes(id)) {
                                var minLevel = itemRes[id - 1].minLevel;
                                var name = itemRes[id - 1].name;
                                var type = itemRes[id - 1].type;
                                var statName = itemRes[id - 1].statName;
                                var statValue = itemRes[id - 1].statValue;
                                Utils.log("\x1b[36m%s\x1b[0m", "DB: Has item " + id + ", minlevel: " + minLevel + ", name: " + name);
                                if (await Utils.getLevel(msg.author.id) >= minLevel) {
                                    // Check and remove other equipped items of the same type
                                    var newArray = new Array();
                                    for (var i = 0; i < userEquippedList.length; i++) {
                                        if (itemRes[userEquippedList[i] - 1].type == type) {
                                            Utils.log("\x1b[36m%s\x1b[0m", "DB: Removing " + (userEquippedList[i] - 1));
                                            var statToRemove = itemRes[userEquippedList[i] - 1].statName;
                                            var statValueToRemove = itemRes[userEquippedList[i] - 1].statValue;
                                            if (statToRemove.length > 0) {
                                                await Utils.queryDB("UPDATE users SET " + statToRemove + "=" + statToRemove + "-" + statValueToRemove + " WHERE discordID=" + msg.author.id);
                                                Utils.log("\x1b[36m%s\x1b[0m", "DB: Removed bonuses from " + statToRemove + ": " + statValueToRemove);
                                            } else {
                                                Utils.log("\x1b[36m%s\x1b[0m", "DB: No stat bonuses to remove!");
                                            }
                                        } else {
                                            Utils.log("\x1b[36m%s\x1b[0m", "DB: Pushing " + (userEquippedList[i]));
                                            newArray.push((userEquippedList[i]));
                                        }
                                    }
                                    // Put in the new equipped item
                                    if (statName.length > 0) {
                                        await Utils.queryDB("UPDATE users SET " + statName + "=" + statName + "+" + statValue + " WHERE discordID=" + msg.author.id)
                                        Utils.log("\x1b[36m%s\x1b[0m", "DB: Equipped item " + name + ", added " + statValue + " to " + statName + "!");
                                    }
                                    newArray.push(id);
                                    await Utils.queryDB("UPDATE users SET equippedList='" + JSON.stringify(newArray) + "' WHERE discordID=" + msg.author.id);
                                    embedMsg.addField("Equipped Item", "Successfully equipped **" + name + "**! You can only have one **" + type + "** equipped, so any others have been unequipped for you!");
                                    return msg.embed(embedMsg);
                                } else {
                                    embedMsg.addField("Unable to Equip", "You need to be level **" + minLevel + "** to equip this!");
                                    return msg.embed(embedMsg);
                                }
                            } else {
                                embedMsg.addField("Unable to Equip", "You don't have that item to equip!");
                                return msg.embed(embedMsg);
                            }
			}
		}
    };
}