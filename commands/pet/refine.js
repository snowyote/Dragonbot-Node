const {
    Command
} = require('discord.js-commando');
const Utils = require('../../core/utils.js');
const Discord = require('discord.js');

module.exports = class RefineCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'refine',
            group: 'pet',
            memberName: 'refine',
            description: 'Refine gems',
            examples: ['refine <id>'],
            args: [{
                key: 'id',
                prompt: 'Which gem do you want to refine?',
                type: 'integer',
                default: ''
            }]
        });
    }

    async run(msg, {id}) {
        const embedMsg = new Discord.RichEmbed()
            .setAuthor("House of Dragons Notice", "https://i.imgur.com/CyAb3mV.png")

        let queryRes = await Utils.queryDB("SELECT * FROM users WHERE discordID=" + msg.author.id);
        var gems = JSON.parse(queryRes[0].gems);
        Utils.log("\x1b[36m%s\x1b[0m", "DB: Gems: " + JSON.stringify(gems) + "\n0: " + gems[0] + "\n1: " + gems[1] + "\n2: " + gems[2] + "\n3: " + gems[3] + "\n4: " + gems[4]);
        var tools = JSON.parse(queryRes[0].tools);
        if (tools.length > 0) {
            var hasRefiner = 0;
            Utils.log("\x1b[36m%s\x1b[0m", "DB: Tools includes: " + tools);
            if (tools.includes(1)) hasRefiner = 1;
            if (hasRefiner) {
                if (id > 0) {
                    var userID = queryRes[0].id;
                    Utils.log("\x1b[36m%s\x1b[0m", "DB: Selected user ID " + msg.author.id);
                    if (id == 1) {
                        if (gems[0] >= 4) {
                            var randomLoss = Utils.randomIntIn(0, gems[0] / 10);
                            var refinedGems = Math.ceil((gems[0] - randomLoss) * 0.25);
                            await Utils.queryDB("UPDATE achievement_progress SET gemsRefined=gemsRefined+" + gems[0] + " WHERE id=" + userID);
                            embedMsg.addField("Gem Shards Refined", "You refined **" + gems[0] + "** gemstone shards into **" + refinedGems + "** chipped gems, accidentally breaking **" + randomLoss + "** gemstone shards in the process!");
                            gems[0] = 0;
                            gems[1] += refinedGems;
                        } else {
                            embedMsg.addField("Can't Refine", "You don't have enough gem shards to refine!");
                        }
                    } else if (id == 2) {
                        if (gems[1] >= 5) {
                            var randomLoss = Utils.randomIntIn(0, gems[1] / 10);
                            var refinedGems = Math.ceil((gems[1] - randomLoss) * 0.2);
                            await Utils.queryDB("UPDATE achievement_progress SET gemsRefined=gemsRefined+" + gems[1] + " WHERE id=" + userID);
                            embedMsg.addField("Chipped Gems Refined", "You refined **" + gems[1] + "** chipped gems into **" + refinedGems + "** flawed gems, accidentally breaking **" + randomLoss + "** chipped gems in the process!");
                            gems[1] = 0;
                            gems[2] += refinedGems;
                        } else {
                            embedMsg.addField("Can't Refine", "You don't have enough chipped gems to refine!");
                        }
                    } else if (id == 3) {
                        if (gems[2] >= 10) {
                            var randomLoss = Utils.randomIntIn(0, gems[2] / 10);
                            var refinedGems = Math.ceil((gems[2] - randomLoss) * 0.1);
                            await Utils.queryDB("UPDATE achievement_progress SET gemsRefined=gemsRefined+" + gems[2] + " WHERE id=" + userID);
                            embedMsg.addField("Flawed Gems Refined", "You refined **" + gems[2] + "** flawed gems into **" + refinedGems + "** flawless gems, accidentally breaking **" + randomLoss + "** flawed gems in the process!");
                            gems[2] = 0;
                            gems[3] += refinedGems;
                        } else {
                            embedMsg.addField("Can't Refine", "You don't have enough flawed gems to refine!");
                        }
                    } else if (id == 4) {
                        if (gems[3] >= 20) {
                            var randomLoss = Utils.randomIntIn(0, gems[3] / 10);
                            var refinedGems = Math.ceil((gems[3] - randomLoss) * 0.05);
                            await Utils.queryDB("UPDATE achievement_progress SET gemsRefined=gemsRefined+" + gems[3] + " WHERE id=" + userID);
                            embedMsg.addField("Flawless Gems Refined", "You refined **" + gems[3] + "** flawless gems into **" + refinedGems + "** perfect gems, accidentally breaking **" + randomLoss + "** flawless gems in the process!");
                            gems[3] = 0;
                            gems[4] += refinedGems;
                        } else if (id == 5) {
                            embedMsg.addField("Can't Refine", "You can't refine perfect gems!");
                        } else {
                            embedMsg.addField("Can't Refine", "You don't have enough flawless gems to refine!");
                        }
                    } else {
                        embedMsg.addField("Can't Refine", "That wasn't a valid selection!");
                    }
                } else {
                    embedMsg.addField("Gem Refiner", "Here you can make better quality gems, up to **perfect** quality. 1 chipped requires 4 shards, 1 flawed requires 5 chipped, 1 flawless requires 10 flawed, and 1 perfect requires 20 flawless. In order to use this, please look for the number next to the gem quality you want to refine and use `!refine <number>`!");
                    embedMsg.addField("💎 Gems", "[1] Shards: **" + gems[0] + "**\n" +
                        "[2] Chipped: **" + gems[1] + "**\n" +
                        "[3] Flawed: **" + gems[2] + "**\n" +
                        "[4] Flawless: **" + gems[3] + "**\n" +
                        "[5] Perfect: **" + gems[4] + "**", true);
                }
                await Utils.queryDB("UPDATE users SET gems='" + JSON.stringify(gems) + "' WHERE discordID=" + msg.author.id);
                return msg.embed(embedMsg);
            } else {
                embedMsg.addField("Can't Refine", "You don't have a gem refiner! Buy one in the `!market`!");
                return msg.embed(embedMsg);
            }
        } else {
            embedMsg.addField("Can't Refine", "You don't have a gem refiner! Buy one in the `!market`!");
            return msg.embed(embedMsg);
        }
    };
}