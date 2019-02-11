const {
    Command
} = require('discord.js-commando');
const Utils = require('../../core/utils.js');
const Discord = require('discord.js');

module.exports = class SkillCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'skill',
            group: 'rpg',
            memberName: 'skill',
            description: 'Set your skills!',
            examples: ['skill <id> <amount>'],
            args: [{
                    key: 'id',
                    prompt: 'Which skill do you want to upgrade?',
                    type: 'integer',
                    default: ''
                },
                {
                    key: 'amount',
                    prompt: 'How many points do you want to upgrade this skill by?',
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

        let userRes = await Utils.queryDB("SELECT * FROM users WHERE discordID=" + msg.author.id);
        Utils.log("\x1b[36m%s\x1b[0m", "DB: Selected user ID " + msg.author.id);

		var currentStats = JSON.parse(userRes[0].level);
		var currentLevel = currentStats[0];
        var currentVitality = userRes[0].vitality;
        var currentArcana = userRes[0].arcana;
        var currentProwess = userRes[0].prowess;
        var currentFortitude = userRes[0].fortitude;
        var currentPrecision = userRes[0].precise;
        var currentAgility = userRes[0].agility;
        var currentImpact = userRes[0].impact;
		
		let skillMax = 8;
		if(currentLevel >= 5) skillMax = 12;
		if(currentLevel >= 10) skillMax = 16;
		if(currentLevel >= 15) skillMax = 20;
		if(currentLevel >= 20) skillMax = 24;
		if(currentLevel >= 30) skillMax = 28;
		if(currentLevel >= 40) skillMax = 30;
		if(currentLevel >= 50) skillMax = 33;
		
		var maxPoints = 20+((currentLevel-1)*4)

        var pointsRemaining = maxPoints - (currentProwess + currentPrecision + currentFortitude + currentAgility + currentImpact + currentVitality + currentArcana);
        if (!id) {
            embedMsg.addField("Skill Upgrades", "You have **" + pointsRemaining + "** stat points remaining to allocate!");
            embedMsg.addField("1: Prowess (" + currentProwess + "/"+skillMax+")", "Increases outgoing damage");
            embedMsg.addField("2: Fortitude (" + currentFortitude + "/"+skillMax+")", "Decreases incoming damage");
            embedMsg.addField("3: Precision (" + currentPrecision + "/"+skillMax+")", "Chance of double damage");
            embedMsg.addField("4: Agility (" + currentAgility + "/"+skillMax+")", "Chance of avoiding most damage");
            embedMsg.addField("5: Impact (" + currentImpact + "/"+skillMax+")", "Chance of causing enemies to skip a turn");
            embedMsg.addField("6: Vitality (" + currentVitality + "/"+skillMax+")", "+25 health points");
            embedMsg.addField("7: Arcana (" + currentArcana + "/"+skillMax+")", "+25 magic power");
            embedMsg.setFooter("!skill <stat number> <amount> - upgrade a stat by a certain number of points!")
            return msg.embed(embedMsg);
        } else {
            if (pointsRemaining > 0) {
                var upgradeMultiplier = 1;
                var upgradeMax = 0;
                var upgradeName = "";
                var current = 0;
                var skillToUpgrade = "none";
                switch (id) {
                    case 1:
                        skillToUpgrade = "prowess";
                        upgradeName = "Prowess";
                        upgradeMax = skillMax;
                        current = currentProwess;
                        break;
                    case 2:
                        skillToUpgrade = "fortitude";
                        upgradeName = "Fortitude";
                        upgradeMax = skillMax;
                        current = currentFortitude;
                        break;
                    case 3:
                        skillToUpgrade = "precise";
                        upgradeName = "Precision";
                        upgradeMax = skillMax;
                        current = currentPrecision;
                        break;
                    case 4:
                        skillToUpgrade = "agility";
                        upgradeName = "Agility";
                        upgradeMax = skillMax;
                        current = currentAgility;
                        break;
                    case 5:
                        skillToUpgrade = "impact";
                        upgradeName = "Impact";
                        upgradeMax = skillMax;
                        current = currentImpact;
                        break;
                    case 6:
                        skillToUpgrade = "vitality";
                        upgradeName = "Vitality";
                        upgradeMax = skillMax;
                        current = currentVitality;
                        break;
                    case 7:
                        skillToUpgrade = "arcana";
                        upgradeName = "Arcana";
                        upgradeMax = skillMax;
                        current = currentArcana;
                        break;
                }
                if (skillToUpgrade !== "none") {
                    Utils.log("\x1b[36m%s\x1b[0m", "DB: Upgrade check: " + upgradeName + ", max: " + upgradeMax + ", current: " + current + ", amount: " + (amount * upgradeMultiplier));
                    if (userRes[0].skillPoints - (amount) < 0) {
                        embedMsg.addField("Can't Upgrade", "You don't have enough stat points for that!");
                        return msg.embed(embedMsg);
                    } else if (current >= upgradeMax) {
                        embedMsg.addField("Can't Upgrade", "You're already at the maximum amount of points for this skill!");
                        return msg.embed(embedMsg);
                    } else if (current + (amount * upgradeMultiplier) > upgradeMax) {
                        embedMsg.addField("Can't Upgrade", "That would upgrade that skill above the maximum of **" + upgradeMax + "**! Use less stat points!");
                        return msg.embed(embedMsg);
                    } else {
                        await Utils.queryDB("UPDATE users SET " + skillToUpgrade + "=" + skillToUpgrade + "+" + (amount * upgradeMultiplier) + " WHERE discordID=" + msg.author.id);
                        embedMsg.addField("Upgraded " + upgradeName, upgradeName + " successfully upgraded by **" + amount * upgradeMultiplier + "** stat point(s)!");
                        return msg.embed(embedMsg);
                    }
                } else {
                    embedMsg.addField("Can't Upgrade", "That wasn't a valid skill to upgrade!");
                    return msg.embed(embedMsg);
                }
            } else {
                embedMsg.addField("Can't Upgrade", "You don't have any remaining stat points to use!");
                return msg.embed(embedMsg);
            }
        }
    };
}