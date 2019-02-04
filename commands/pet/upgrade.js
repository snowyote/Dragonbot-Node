const {
    Command
} = require('discord.js-commando');
const Utils = require('../../core/utils.js');
const Discord = require('discord.js');

module.exports = class UpgradeCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'upgrade',
            group: 'pet',
            memberName: 'upgrade',
            description: 'Upgrade your pets perks!',
            examples: ['upgrade <id> <amount>'],
            args: [{
                    key: 'id',
                    prompt: 'Which stat do you want to upgrade?',
                    type: 'integer',
                    default: ''
                },
                {
                    key: 'amount',
                    prompt: 'How many points do you want to upgrade this stat by?',
                    type: 'integer',
                    default: '',
                    min: 1
                }
            ]
        });
    }

    async run(msg, {
        id,
        amount
    }) {
        const embedMsg = new Discord.RichEmbed()
            .setAuthor("House of Dragons Notice", "https://i.imgur.com/CyAb3mV.png")
            .setDescription("<@" + msg.author.id + ">")

        let queryRes = await Utils.queryDB("SELECT * FROM users WHERE discordID=" + msg.author.id);
        console.log("DB: Selected user ID " + msg.author.id);

        var active = queryRes[0].activePet;

        if (active > 0) {
            const petRes = await Utils.queryDB("SELECT * FROM pets WHERE id=" + active);
            console.log("DB: Selected pet ID " + active);
            var currentSkillPoints = petRes[0].skillPoints;
            var currentMaxStamina = petRes[0].maxStamina;
            var currentLuck = petRes[0].luck;
            var currentAvarice = petRes[0].avarice;
            var currentHunting = petRes[0].hunting;
            var currentMining = petRes[0].mining;
            var currentIntel = petRes[0].intelligence;
            if (petRes[0].isEgg == 0) {
                if (petRes[0].skillPoints > 0) {
                    if (!id) {
                        embedMsg.addField("Perk Upgrades", "You have **" + currentSkillPoints + "** affection points remaining to allocate!");
                        embedMsg.addField("1: Max Stamina (" + currentMaxStamina + "/500)", "Increases maximum stamina by 5");
                        embedMsg.addField("2: Luck (" + currentLuck + "/10)", "Increases chance of finding crates/keys");
                        embedMsg.addField("3: Avarice (" + currentAvarice + "/100)", "Increases coins found (100% per point)");
                        embedMsg.addField("4: Intelligence (" + currentIntel + "/100)", "Increases experience points gained (5% per point)");
                        embedMsg.addField("5: Hunting (" + currentHunting + "/10)", "Increases food gained by exploring (100% per point)");
                        embedMsg.addField("6: Mining (" + currentMining + "/100)", "Increases depth you can mine");
                        embedMsg.setFooter("hod?upgrade <perk number> <amount> - upgrade a perk by a certain number of points!")
                        return msg.embed(embedMsg);
                    } else {
                        var upgradeMultiplier = 1;
                        var upgradeMax = 0;
                        var upgradeName = "";
                        var current = 0;
                        var skillToUpgrade = "none";
                        switch (id) {
                            case '1':
                                skillToUpgrade = "maxStamina";
                                upgradeName = "Max Stamina";
                                upgradeMax = 500;
                                current = currentMaxStamina;
                                upgradeMultiplier = 5;
                                break;
                            case '2':
                                skillToUpgrade = "luck";
                                upgradeName = "Luck";
                                upgradeMax = 10;
                                current = currentLuck;
                                break;
                            case '3':
                                skillToUpgrade = "avarice";
                                upgradeName = "Avarice";
                                upgradeMax = 100;
                                current = currentAvarice;
                                break;
                            case '4':
                                skillToUpgrade = "intelligence";
                                upgradeName = "Intelligence";
                                upgradeMax = 100;
                                current = currentIntel;
                                break;
                            case '5':
                                skillToUpgrade = "hunting";
                                upgradeName = "Hunting";
                                upgradeMax = 10;
                                current = currentHunting;
                                break;
                            case '6':
                                skillToUpgrade = "mining";
                                upgradeName = "Mining";
                                upgradeMax = 100;
                                current = currentMining;
                                break;
                        }
                        if (skillToUpgrade !== "none") {
                            console.log("DB: Upgrade check: " + upgradeName + ", max: " + upgradeMax + ", current: " + current + ", amount: " + (amount * upgradeMultiplier));
                            if (petRes[0].skillPoints - (amount) < 0) {
                                embedMsg.addField("Can't Upgrade", "You don't have enough affection points for that!");
                                return msg.embed(embedMsg);
                            } else if (current >= upgradeMax) {
                                embedMsg.addField("Can't Upgrade", "You're already at the maximum amount of points for this perk!");
                                return msg.embed(embedMsg);
                            } else if (current + (amount * upgradeMultiplier) > upgradeMax) {
                                embedMsg.addField("Can't Upgrade", "That would upgrade that perk above the maximum of **" + upgradeMax + "**! Use less affection points!");
                                return msg.embed(embedMsg);
                            } else {
                                await Utils.queryDB("UPDATE pets SET " + skillToUpgrade + "=" + skillToUpgrade + "+" + (amount * upgradeMultiplier) + ", skillPoints=skillPoints-" + amount + " WHERE id=" + active);
                                embedMsg.addField("Upgraded " + upgradeName, upgradeName + " successfully upgraded by **" + amount * upgradeMultiplier + "** affection point(s)!");
                                return msg.embed(embedMsg);
                            }
                        } else {
                            embedMsg.addField("Can't Upgrade", "That wasn't a valid perk to upgrade!");
                            return msg.embed(embedMsg);
                        }
                    }
                } else {
                    embedMsg.addField("Can't Upgrade", "This pet doesn't have any remaining affection points to use!");
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