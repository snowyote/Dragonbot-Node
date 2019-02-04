const {
    Command
} = require('discord.js-commando');
const Utils = require('../../core/utils.js');
const Discord = require('discord.js');

module.exports = class SlotsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'achievements',
            group: 'pet',
            memberName: 'achievements',
            description: 'View achievements',
            examples: ['achievements <page>'],
            args: [{
                key: 'page',
                prompt: 'What page do you want to view? (Can use 1, 2 or 3)',
                type: 'integer',
                validate: page => {
                    if (page > 0) return true;
                    return 'Invalid page number!';
                }
            }]
        });
    }

    async run(msg, {page}) {
        const embedMsg = new Discord.RichEmbed()
            .setAuthor("House of Dragons Achievements", "https://i.imgur.com/CyAb3mV.png")
            .setDescription("<@" + msg.author.id + ">");

        let userRes = await Utils.queryDB("SELECT * FROM users WHERE discordID=" + msg.author.id);
        let achievements = await Utils.queryDB("SELECT * FROM achievements ORDER BY varRequired ASC");
        let achProgress = await Utils.queryDB("SELECT * FROM achievement_progress WHERE id=" + userRes[0].id);
        var achKeys = Object.keys(achProgress[0]);
        var unlocked = JSON.parse(userRes[0].achievements);
        if (page == 1) {
            embedMsg.setFooter("Page 1/3 - Use hod?achievements 2 for the next page!");
            for (var i = 0; i < 24; i++) {
                var varToCheck = parseInt(achievements[i].varToCheck);
                var varRequired = parseInt(achievements[i].varRequired);
                if (achProgress[0][achKeys[varToCheck]] >= varRequired || unlocked.includes(achievements[i].id)) {
                    embedMsg.addField("✅ ***" + achievements[i].name + "***", achievements[i].description + "\n**Unlocked!**", true);
                } else {
                    embedMsg.addField("❌ ***" + achievements[i].name + "***", achievements[i].description + "\n" + Math.round(achProgress[0][achKeys[varToCheck]]) + "/" + varRequired, true);
                }
            }
        } else if (page == 2) {
            embedMsg.setFooter("Page 2/3 - Use hod?achievements 3 for the next page!");
            for (var i = 25; i < 49; i++) {
                var varToCheck = parseInt(achievements[i].varToCheck);
                var varRequired = parseInt(achievements[i].varRequired);
                if (achProgress[0][achKeys[varToCheck]] >= varRequired || unlocked.includes(achievements[i].id)) {
                    embedMsg.addField("✅ ***" + achievements[i].name + "***", achievements[i].description + "\n**Unlocked!**", true);
                } else {
                    embedMsg.addField("❌ ***" + achievements[i].name + "***", achievements[i].description + "\n" + Math.round(achProgress[0][achKeys[varToCheck]]) + "/" + varRequired, true);
                }
            }
        } else if (page == 3) {
            embedMsg.setFooter("Page 3/3 - Use hod?achievements 1 for the first page!");
            for (var i = 49; i < achievements.length; i++) {
                var varToCheck = parseInt(achievements[i].varToCheck);
                var varRequired = parseInt(achievements[i].varRequired);
                if (achProgress[0][achKeys[varToCheck]] >= varRequired || unlocked.includes(achievements[i].id)) {
                    embedMsg.addField("✅ ***" + achievements[i].name + "***", achievements[i].description + "\n**Unlocked!**", true);
                } else {
                    embedMsg.addField("❌ ***" + achievements[i].name + "***", achievements[i].description + "\n" + Math.round(achProgress[0][achKeys[varToCheck]]) + "/" + varRequired, true);
                }
            }
        } else {
			return msg.say("Invalid page selected!");
		}
        return msg.embed(embedMsg);
    };
}