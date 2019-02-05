const {Command} = require('discord.js-commando');
const Utils = require('../../core/utils.js');
const Discord = require('discord.js');

module.exports = class AdoptCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'adopt',
            group: 'pet',
            memberName: 'adopt',
            description: 'Adopt a pet, up to 10',
            examples: ['adopt']
        });
    }

    async run(msg) {
		const embedMsg = new Discord.RichEmbed()
			.setAuthor("Pet Adoption Center", "https://i.imgur.com/CyAb3mV.png")
			.setColor("#FDF018")
		
        const userRes = await Utils.queryDB("SELECT id, activePet, petID, coins FROM users WHERE discordID=" + msg.author.id);
        var petJSON = JSON.parse(userRes[0].petID);
        var activePet = JSON.parse(userRes[0].activePet);
        var petNum = petJSON.length;
        var coins = userRes[0].coins;
        var stringified = Utils.stringifyNumber(petNum + 1);
        var cost = 500;
        if (petNum > 0) cost = Math.floor(Math.pow((petNum + 1) * 500, 1.2));
        if (petNum < 10) {
            if (coins >= cost) {
                var currentTime = new Date().getTime();
                var hatchTime = new Date().getTime() + (300000 * ((petNum + 1) * 3));
                var formattedTime = Utils.formatTimeUntil(hatchTime);
                embedMsg.addField("Notice", "You adopted your " + stringified + " pet! As it's your " + stringified + ", you've been charged **" + cost + "** coins!\nIt will hatch in **" + formattedTime + "**, use `!hatch` to check progress!");
                const addPet = await Utils.queryDB("INSERT INTO pets(hatchTime, ownerName) VALUES (" + hatchTime + ", '" + msg.author.id + "'); ")
                var newPetID = addPet.insertId;
                activePet = [newPetID];
                petJSON.push(newPetID);
                var petsString = JSON.stringify(petJSON);
                Utils.log("\x1b[36m%s\x1b[0m", "DB: " + msg.author.id + " successfully adopted pet ID " + newPetID + "!");
                const updatePets = await Utils.queryDB("UPDATE users SET petID='" + petsString + "', activePet='" + activePet + "', coins=coins-" + cost + " WHERE id=" + userRes[0].id);
                Utils.log("\x1b[36m%s\x1b[0m", "DB: " + newPetID + " has been added to user " + userRes[0].id + "!");
                Utils.log("\x1b[36m%s\x1b[0m", "DB: " + newPetID + " has been set as active for user " + userRes[0].id + "!");
                Utils.log("\x1b[36m%s\x1b[0m", "DB: " + msg.author.id + " has been charged " + cost + " coins!");
                await Utils.queryDB("UPDATE achievement_progress SET petsAdopted=petsAdopted+1 WHERE id=" + userRes[0].id);
                return msg.embed(embedMsg);
            } else {
                embedMsg.addField("Notice", "In order to adopt your " + stringified + " pet, you need **" + cost + "** coins!\nYou currently have **" + coins + "**!");
                return msg.embed(embedMsg);
            }
        } else {
            embedMsg.addField("Notice", "You cannot adopt any more pets currently!");
            return msg.embed(embedMsg);
        }
    };
}