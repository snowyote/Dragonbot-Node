const {Command} = require('discord.js-commando');
const Utils = require('../../core/utils.js');
const Discord = require('discord.js');

module.exports = class SleepCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'sleep',
            group: 'pet',
            memberName: 'sleep',
            description: 'Recover stamina by putting your active pet to sleep',
            examples: ['sleep']
        });
    }

    async run(msg) {
        const embedMsg = new Discord.RichEmbed()
            .setAuthor("House of Dragons Notice", "https://i.imgur.com/CyAb3mV.png")

        const userRes = await Utils.queryDB("SELECT activePet FROM users WHERE discordID=" + msg.author.id);
        var active = userRes[0].activePet;
        if (active > 0) {
            const petRes = await Utils.queryDB("SELECT isSleeping, name, stamina, maxStamina, sleepBoost, sleepTime FROM pets WHERE id=" + active);
            if (petRes[0].isSleeping == 1) {
                embedMsg.addField("Can't sleep!", "Your pet **" + petRes[0].name + "** is sleeping, and will wake up in **" + Utils.formatTimeUntil(petRes[0].sleepTime) + "**!");
				return msg.embed(embedMsg);
            } else {
                if (petRes[0].stamina < petRes[0].maxStamina) {
                    var randomTime = Math.floor(Math.random() * (600000 - 400000 + 1) + 400000);
                    var currentTime = new Date().getTime();
                    var maxStamina = petRes[0].maxStamina;
                    embedMsg.addField("Sleeping!", "Your pet **" + petRes[0].name + "** is now sleeping, and will wake up in **" + Utils.formatTimeUntil(currentTime + randomTime) + "**!");
                    await Utils.queryDB("UPDATE pets SET sleepTime=" + (currentTime + randomTime) + ", stamina=" + maxStamina + ", isSleeping=1 WHERE id=" + active)
                    console.log("DB: Pet id " + active + " is now sleeping!");
					return msg.embed(embedMsg);
                } else {
                    embedMsg.addField("Can't sleep!", "Your pet **" + petRes[0].name + "** is already well rested!\n(" + petRes[0].stamina + "/" + petRes[0].maxStamina + " Stamina)");
					return msg.embed(embedMsg);
                }
            }
        } else {
            embedMsg.addField("Can't sleep!", "You don't own a pet, to get one use `!adopt`!");
			return msg.embed(embedMsg);
        }
    };
}