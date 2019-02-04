const {Command} = require('discord.js-commando');
const Utils = require('../../core/utils.js');
const Discord = require('discord.js');

module.exports = class SwitchCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'switch',
            group: 'pet',
            memberName: 'switch',
            description: 'Switch your active pet',
            examples: ['switch <id>'],
			args: [
				{
					key: 'pet',
					prompt: 'Which pet do you want to switch to?',
					type: 'integer',
					default: ''
				}
			]
        });
    }

    async run(msg, {pet}) {
		const embedMsg = new Discord.RichEmbed()
			.setAuthor("Your Pets", "https://i.imgur.com/CyAb3mV.png")
			.setDescription("<@"+msg.author.id+">")
			.setColor("#FDF018")
		
		const petIDs = await Utils.queryDB("SELECT id, petID, activePet FROM users WHERE discordID=" + msg.author.id);
        var userID = petIDs[0].id;
        var petID = JSON.parse(petIDs[0].petID);
		var aPet = petIDs[0].activePet;
		if (petIDs.length > 0) {
			if (!pet) {
				embedMsg.setFooter("hod?switch <number> - to switch your active pet!");
				for (var index = 0; index < petID.length; index++) {
					let i = index;
					let petList = petID;
					let currentPets = JSON.parse(petIDs[0].petID);
					let currentPet = currentPets[i];
					console.log("DB: Pet Check\nLength: " + petList.length + "\nIndex: " + i + "\nCurrent Pet: " + currentPet);
					let petSelect = await Utils.queryDB("SELECT name, level, isEgg, petType FROM pets WHERE id=" + currentPet + " ORDER BY level DESC")
					console.log("DB: Pet " + currentPet + " name = " + petSelect[0].name + ", level = " + petSelect[0].level + ", type = " + petSelect[0].petType + ", isEgg = " + petSelect[0].isEgg);
					if (petSelect[0].isEgg == 1) {
						embedMsg.addField(capitalize(stringifyNumber((i + 1))) + " Pet", "Not hatched yet!");
					} else {
						let petType = await Utils.queryDB("SELECT name, rarity FROM pet_types WHERE id="+petSelect[0].petType);
						var rarity = "None?";
						
						if(petType[0].rarity == 6) rarity = "Common";
						else if(petType[0].rarity == 4) rarity = "Uncommon";
						else if(petType[0].rarity == 3) rarity = "Rare";
						else rarity = "Ultra Rare";
															
						var petName = petType[0].name;
						petName = petName.replace(/"/g,"");
						console.log("DB: "+petID[i]+" = "+aPet+"?");
						if(petID[i] == aPet) {
							embedMsg.addField("🌟 "+petSelect[0].name+" (Active)", "**Level**: "+petSelect[0].level+"\n**Type**: "+petName+" (**"+rarity+"**)");
						} else {
							embedMsg.addField("[**"+(i+1)+"**] "+petSelect[0].name, "**Level**: "+petSelect[0].level+"\n**Type**: "+petName+" (**"+rarity+"**)");
						}
					}
				}
				return msg.embed(embedMsg);
			} else {
				if(pet > 0 && pet <= petID.length) {
					await Utils.queryDB("UPDATE users SET activePet="+petID[pet-1]+" WHERE id="+userID)
					console.log("DB: Active pet for "+userID+" changed to "+(pet-1));
					embedMsg.addField("Active Pet Changed", "Successfully changed your active pet!");
					return msg.embed(embedMsg);
				} else {
					embedMsg.addField("Notice", "That's not a valid pet to select!");
					return msg.embed(embedMsg);
				}
			}
		} else {
			embedMsg.addField("Notice", "You don't have any pets! Get one with `hod?adopt`!");
			return msg.embed(embedMsg);
		}
		
    };
}