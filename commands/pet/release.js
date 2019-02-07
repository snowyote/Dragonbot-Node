const {
    Command
} = require('discord.js-commando');
const Utils = require('../../core/utils.js');
const Discord = require('discord.js');

module.exports = class ReleaseCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'release',
            group: 'pet',
            memberName: 'release',
            description: 'Release your active pet',
            examples: ['release'],
            args: [
			{
                key: 'verify',
                prompt: 'Verify the release?',
                type: 'string',
				default: ''
			}]
        });
    }

    async run(msg, {verify}) {
		const embedMsg = new Discord.RichEmbed()
			.setAuthor("House of Dragons Notice", "https://i.imgur.com/CyAb3mV.png")
			.setColor("#FDF018")
		
        let queryRes = await Utils.queryDB("SELECT * FROM users WHERE discordID=" + msg.author.id);
		var userID = queryRes[0].id;
		var pets = JSON.parse(queryRes[0].petID);
		var active = queryRes[0].activePet;
		if(active > 0) {
			let petRes = await Utils.queryDB("SELECT * FROM pets WHERE id="+active);
			let petName = petRes[0].name;
			let petLevel = petRes[0].level;
			if(verify !== "verify") {
				embedMsg.addField("Are you sure?", "If you're sure you want to release your pet **"+petName+"** (Affection Level **"+petLevel+"**), type `!release verify` now!");
				return msg.embed(embedMsg);
			} else {
				embedMsg.addField("Pet Released", "Your pet has been released!");
				
				var newPets = new Array();
				
				for(var pi = 0; pi < pets.length; pi++) {
					if(pets[pi] == active) {
						Utils.log("\x1b[36m%s\x1b[0m", "DB: Found active pet!");
					} else {
						newPets.push(pets[pi]);
					}
				}
				
				if(pets.length > 1) {
					Utils.log("\x1b[36m%s\x1b[0m", "DB: Has other pets");
					await Utils.queryDB("UPDATE users SET activePet="+newPets[0]+", petID='"+JSON.stringify(newPets)+"' WHERE discordID="+msg.author.id);
				} else {
					Utils.log("\x1b[36m%s\x1b[0m", "DB: Has no other pets");
					await Utils.queryDB("UPDATE users SET activePet=0, petID='[]' WHERE discordID="+msg.author.id);
				}
				Utils.log("\x1b[36m%s\x1b[0m", "DB: Deleting pet ID "+active);
				await Utils.queryDB("INSERT pets_graveyard SELECT * FROM pets WHERE id="+active);
				await Utils.queryDB("DELETE FROM pets WHERE id="+active);
				return msg.embed(embedMsg);
			}
		} else {
			embedMsg.addField("Can't Release Pet", "You don't have a pet to release, get one with `!adopt`!");
			return msg.embed(embedMsg);
		}
	};
}