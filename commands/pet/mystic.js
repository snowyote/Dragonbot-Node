const {
    Command
} = require('discord.js-commando');
const Utils = require('../../core/utils.js');
const Discord = require('discord.js');

module.exports = class MysticCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'mystic',
            group: 'pet',
            memberName: 'mystic',
            description: 'Use a mystic orb!',
            examples: ['mystic <id> <amount>'],
            args: [{
                    key: 'id',
                    prompt: 'Which mysticism do you want?',
                    type: 'integer',
                    default: ''
                },
                {
                    key: 'levels',
                    prompt: 'How many levels?',
                    type: 'integer',
                    default: '',
                    min: 1
                }
            ]
        });
    }

    async run(msg, {id,levels}) {
		const embedMsg = new Discord.RichEmbed()
            .setAuthor("House of Dragons Notice", "https://i.imgur.com/CyAb3mV.png")

        let queryRes = await Utils.queryDB("SELECT * FROM users WHERE discordID=" + msg.author.id);
		var userID = queryRes[0].id;
        console.log("DB: Selected user ID " + msg.author.id);
        var active = queryRes[0].activePet;
        if (active > 0) {
            const petRes = await Utils.queryDB("SELECT * FROM pets WHERE id=" + active);
            console.log("DB: Selected pet ID " + active);
            if (petRes[0].isEgg == 0) {
                if (queryRes[0].mysticOrbs > 0) {
                    if (!id) {
                        embedMsg.addField("Mysticism", "You have **" + queryRes[0].mysticOrbs + "** Mystic Orbs remaining to use!");
                        embedMsg.addField("1: Rebirth", "Reset all of your pet's stats to 0 and return all stat points!");
                        embedMsg.addField("2: Transform", "Randomize your active pet!");
                        embedMsg.addField("3: Change Home", "Randomize the background of your pet!");
                        embedMsg.addField("4: Love Arrow", "Level up your pet's affection by one!");
                        embedMsg.setFooter("hod?mystic <number> [amount] - to use a mystic orb!")
                        return msg.embed(embedMsg);
                    } else {
                            var currentLevel = petRes[0].level;
                            switch (id) {
                                case 1:
                                    await Utils.queryDB("UPDATE pets SET luck=0, exp=0, intelligence=0, hunting=0, mining=0, avarice=0, maxStamina=100, stamina=100, skillPoints=" + (currentLevel - 1) + " WHERE id=" + active);
                                    embedMsg.addField("Mysticism Applied", "Your pet's skills have been reset!");
									await Utils.queryDB("UPDATE users SET mysticOrbs=mysticOrbs-1 WHERE discordID="+msg.author.id);
									await Utils.queryDB("UPDATE achievement_progress SET orbsUsed=orbsUsed+1 WHERE id="+userID);
                                    return msg.embed(embedMsg);
                                    break;
                                case 2:
                                    const petType = await Utils.queryDB("SELECT * FROM pet_types");
                                    var pets = new Array();
                                    var petsWeight = new Array();
                                    for (var pi = 0; pi < petType.length; pi++) {
                                        pets.push(petType[pi].id);
                                        petsWeight.push(parseInt(petType[pi].rarity));
                                    }
                                    var totalweight = petsWeight.reduce(getSum);
									console.log("DB: Total weight is "+totalweight);
                                    var weighedpets = new Array();
                                    var currPet = 0;
                                    while (currPet < pets.length) {
                                        for (var pw = 0; pw < petsWeight[currPet]; pw++) {
                                            weighedpets[weighedpets.length] = pets[currPet];
										}
                                        currPet++;
                                    }
                                    var randomnumber = Math.floor(Math.random() * totalweight);
									console.log("DB: Pet number "+randomnumber+" selected!");
                                    var rarity = "";
                                    if (petType[weighedpets[randomnumber] - 1].rarity == 6) rarity = "Common";
                                    else if (petType[weighedpets[randomnumber] - 1].rarity == 4) rarity = "Uncommon";
                                    else if (petType[weighedpets[randomnumber] - 1].rarity == 3) rarity = "Rare";
                                    else if (petType[weighedpets[randomnumber] - 1].rarity == 1) rarity = "Ultra Rare";
                                    else rarity = "None?";

                                    var randomPetID = weighedpets[randomnumber];
                                    var petName = petType[randomPetID - 1].name;

                                    await Utils.queryDB("UPDATE pets SET petType=" + randomPetID + " WHERE id=" + active);
                                    embedMsg.addField("Mysticism Applied", "Your pet has been transformed into **" + petName + "** (**" + rarity + "**)!");
									await Utils.queryDB("UPDATE users SET mysticOrbs=mysticOrbs-1 WHERE discordID="+msg.author.id);
									await Utils.queryDB("UPDATE achievement_progress SET orbsUsed=orbsUsed+1 WHERE id="+userID);
                                    return msg.embed(embedMsg);
                                    break;
                                case 3:
                                    const bgType = await Utils.queryDB("SELECT id, name FROM backgrounds");
                                    var randomBG = Math.floor(Math.random() * bgType.length);
                                    var bgName = bgType[randomBG].name;
                                    var bgID = bgType[randomBG].id;
                                    await Utils.queryDB("UPDATE pets SET bgType=" + bgID + " WHERE id=" + active);
                                    embedMsg.addField("Mysticism Applied", "Your pet's background has been changed to **" + bgName + "**!");
									await Utils.queryDB("UPDATE users SET mysticOrbs=mysticOrbs-1 WHERE discordID="+msg.author.id);
									await Utils.queryDB("UPDATE achievement_progress SET orbsUsed=orbsUsed+1 WHERE id="+userID);
                                    return msg.embed(embedMsg);
                                    break;
                                case 4:
									var amount = 1;
									if(levels > 1) {
										amount = levels;
									}
									if(queryRes[0].mysticOrbs >= amount) {
										await Utils.queryDB("UPDATE pets SET level=level+"+amount+", skillPoints=skillPoints+"+amount+" WHERE id=" + active);
										embedMsg.addField("Mysticism Applied", "Your pet has been given **"+amount+"** affection levels!");
										await Utils.queryDB("UPDATE users SET mysticOrbs=mysticOrbs-"+amount+" WHERE discordID="+msg.author.id);
										await Utils.queryDB("UPDATE achievement_progress SET orbsUsed=orbsUsed+"+amount+" WHERE id="+userID);
										return msg.embed(embedMsg);
									}
                                    break;
                                default:
                                    embedMsg.addField("Can't Use Orb", "That wasn't a valid mysticism! Try `1`, `2`, `3`, or `4`!");
                                    return msg.embed(embedMsg);
                                    break;
                            }
                    }
                } else {
                    embedMsg.addField("Can't Use Orb", "This pet doesn't have any remaining Mystic Orbs to use!");
                    return msg.embed(embedMsg);
                }

            } else {
                embedMsg.addField("Not Ready", "This pet hasn't been hatched yet, use `hod?hatch` to check up on it!");
                return msg.embed(embedMsg);
            }
        } else {
            embedMsg.addField("No Pet", "You don't have a pet, get one using `hod?adopt`!");
            return msg.embed(embedMsg);
		}
    };
}