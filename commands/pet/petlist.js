const {Command} = require('discord.js-commando');
const Utils = require('../../core/utils.js');
const Discord = require('discord.js');

module.exports = class PetListCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'petlist',
            group: 'pet',
            memberName: 'petlist',
            description: 'View the list of possible pets',
            examples: ['petlist']
        });
    }

    async run(msg) {
		const petTypes = await Utils.queryDB("SELECT * FROM pet_types");
		var countArray = [0,0,0,0];
		var stringArray = ["","","",""];
		var percentArray = [0,0,0,0];
		for(var i = 0; i < petTypes.length; i++) {
			if(petTypes[i].rarity == 6) {
				countArray[0]+=6;
				stringArray[0] = stringArray[0] + petTypes[i].name + "\n";
			}
			if(petTypes[i].rarity == 4) {
				countArray[1]+=4;
				stringArray[1] = stringArray[1] + petTypes[i].name + "\n";
			}
			if(petTypes[i].rarity == 3) {
				countArray[2]+=3;
				stringArray[2] = stringArray[2] + petTypes[i].name + "\n";
			}
			if(petTypes[i].rarity == 1) {
				countArray[3]+=1;
				stringArray[3] = stringArray[3] + petTypes[i].name + "\n";
			}
		}
			
		stringArray[0] = stringArray[0].slice(0, -1);
		stringArray[1] = stringArray[1].slice(0, -1);
		stringArray[2] = stringArray[2].slice(0, -1);
		stringArray[3] = stringArray[3].slice(0, -1);
			
		percentArray[0] = Math.round((countArray[0]/countArray.reduce(Utils.getSum)) * 100);
		percentArray[1] = Math.round((countArray[1]/countArray.reduce(Utils.getSum)) * 100);
		percentArray[2] = Math.round((countArray[2]/countArray.reduce(Utils.getSum)) * 100);
		percentArray[3] = Math.round((countArray[3]/countArray.reduce(Utils.getSum)) * 100);
			
		const embedMsg = new Discord.RichEmbed()
			.setAuthor("Pet List", "https://i.imgur.com/CyAb3mV.png")
			.setColor("#FDF018")
			.addField("Common ("+percentArray[0]+"%)", stringArray[0], true)
			.addField("Uncommon ("+percentArray[1]+"%)", stringArray[1], true)
			.addField("Rare ("+percentArray[2]+"%)", stringArray[2], true)
			.addField("Ultra Rare ("+percentArray[3]+"%)", stringArray[3], true)
			
		return msg.embed(embedMsg);
    };
}