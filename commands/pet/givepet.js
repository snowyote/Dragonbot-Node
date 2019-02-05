const {Command} = require('discord.js-commando');
const Utils = require('../../core/utils.js');
const Discord = require('discord.js');

module.exports = class SwitchCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'givepet',
            group: 'pet',
            memberName: 'givepet',
            description: 'Give your active pet to someone!',
            examples: ['givepet <user>'],
			args: [
				{
					key: 'user',
					prompt: 'Who do you want to give your active pet to?',
					type: 'user'
				}
			]
        });
    }

    async run(msg, {user}) {
		const embedMsg = new Discord.RichEmbed()
					.setAuthor("House of Dragons Notice", "https://i.imgur.com/CyAb3mV.png")
					
		let userRes = await Utils.queryDB("SELECT * FROM users WHERE discordID=" + msg.author.id);
		let mentionRes = await Utils.queryDB("SELECT * FROM users WHERE discordID=" + user.id);
		let active = userRes[0].activePet;
		if(msg.author.id !== user.id && !user.bot) {
			if(active > 0) {
				let mentionedPetList = JSON.parse(mentionRes[0].petID);
				let userPetList = JSON.parse(userRes[0].petID);
				var newPets = new Array();
					
				for(var pi = 0; pi < userPetList.length; pi++) {
					if(userPetList[pi] == active) {
						mentionedPetList.push(userPetList[pi]);
					} else {
						newPets.push(userPetList[pi]);
					}
				}
				
				if(userPetList.length > 1) {
					console.log("DB: Has other pets");
					await Utils.queryDB("UPDATE users SET activePet="+newPets[0]+", petID='"+JSON.stringify(newPets)+"' WHERE discordID="+msg.author.id);
				} else {
					console.log("DB: Has no other pets");
					await Utils.queryDB("UPDATE users SET activePet=0, petID='[]' WHERE discordID="+msg.author.id);
				}
				
				console.log("DB: Mentioned user has other pets");
				await Utils.queryDB("UPDATE users SET activePet="+mentionedPetList[0]+", petID='"+JSON.stringify(mentionedPetList)+"' WHERE discordID="+user.id);
				await Utils.queryDB("UPDATE pets SET ownerName="+user.id+" WHERE id="+active);
				embedMsg.addField("Pet Given", "<@"+msg.author.id+"> has given a pet to <@"+user.id+">!");
				return msg.embed(embedMsg);
			} else {
				embedMsg.addField("Can't Give Pet", "You don't have any pets to give!");
				return msg.embed(embedMsg);
			}
		} else {
			embedMsg.addField("Can't Give Pet", "You can't give pets to yourself or to bots!");
			return msg.embed(embedMsg);
		}
    };
}