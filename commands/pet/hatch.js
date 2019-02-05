const {Command} = require('discord.js-commando');
const Utils = require('../../core/utils.js');
const Discord = require('discord.js');

module.exports = class HatchCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'hatch',
            group: 'pet',
            memberName: 'hatch',
            description: 'Hatch a pet or check its progress',
            examples: ['hatch']
        });
    }

    async run(msg) {
		const embedMsg = new Discord.RichEmbed()
			.setAuthor("Pet Adoption Center", "https://i.imgur.com/CyAb3mV.png")
			.setDescription("<@"+msg.author.id+">")
			.setColor("#FDF018")

		const petIDs = await Utils.queryDB("SELECT id, petID FROM users WHERE discordID="+msg.author.id);
		var userID = petIDs[0].id;
		var petID = JSON.parse(petIDs[0].petID);
		if(petID.length > 0) {
			for(let i = 0; i < petID.length; i++) {
				let currentPets = JSON.parse(petIDs[0].petID);
				let currentPet = currentPets[i];
				Utils.log("\x1b[36m%s\x1b[0m", "DB: Hatch Check\nLength: "+petID.length+"\nIndex: "+i+"\nCurrent Pet: "+currentPet);
				let petSelect = await Utils.queryDB("SELECT isEgg, hatchTime FROM pets WHERE id="+currentPet);
				Utils.log("\x1b[36m%s\x1b[0m", "DB: Pet "+currentPet+" isEgg = "+petSelect[0].isEgg+", hatchTime = "+petSelect[0].hatchTime);
				let currentTime = new Date().getTime();
				let hatchTime = petSelect[0].hatchTime;
				let formattedTime = Utils.formatTimeUntil(hatchTime);
				if(petSelect[0].isEgg == 1) {
					if(currentTime > hatchTime) {
						await Utils.queryDB("UPDATE pets SET isEgg=0 WHERE id="+currentPet);
						Utils.log("\x1b[36m%s\x1b[0m", "DB: Updated pet ID "+currentPet+" to egg status 0!");
						let petType = await Utils.queryDB("SELECT id, name, rarity FROM pet_types");
						let pets = new Array();
						let petsWeight = new Array();
						for(let pi = 0; pi < petType.length; pi++) {
							pets.push(petType[pi].id);
							petsWeight.push(petType[pi].rarity);
						}
						let totalweight=eval(petsWeight.join("+"));
						let weighedpets=new Array();
						let currPet=0;
							while (currPet<pets.length){ //step through each pet[] element
								for (let pw =0; pw<petsWeight[currPet]; pw++)
									weighedpets[weighedpets.length]=pets[currPet];
								currPet++;
							}
							
						let randomnumber=Math.floor(Math.random()*totalweight);
						let rarity = "";
						if(petType[weighedpets[randomnumber]-1].rarity == 6) rarity = "Common";
						else if(petType[weighedpets[randomnumber]-1].rarity == 4) rarity = "Uncommon";
						else if(petType[weighedpets[randomnumber]-1].rarity == 3) rarity = "Rare";
						else if(petType[weighedpets[randomnumber]-1].rarity == 1) rarity = "Ultra Rare";
						else rarity = "None?";
													
						let randomPetID = weighedpets[randomnumber];
						let petName = petType[randomPetID-1].name;

						let bgType = await Utils.queryDB("SELECT id, name FROM backgrounds")
						let randomBG = Math.floor(Math.random() * bgType.length);
						let bgName = bgType[randomBG].name;
						let bgID = bgType[randomBG].id;
															
						await Utils.queryDB("UPDATE pets SET petType="+randomPetID+", bgType="+bgID+" WHERE id="+currentPet)
						embedMsg.addField(Utils.capitalize(Utils.stringifyNumber(i+1))+" Pet","Pet successfully hatched into a **"+petName+"** (*"+rarity+"*) in a **"+bgName+"**!");
					} else {
						embedMsg.addField(Utils.capitalize(Utils.stringifyNumber(i+1))+" Pet","This pet will hatch in **"+formattedTime+"**!");
					}
				} else {
					embedMsg.addField(Utils.capitalize(Utils.stringifyNumber(i+1))+" Pet","This pet has already been hatched!");
				}
			}
			return msg.embed(embedMsg);
		} else {
			embedMsg.addField("Notice", "You don't have any pets, use `!adopt` to get one!");
			return msg.embed(embedMsg);
		}
    };
}