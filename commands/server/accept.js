const { Command } = require('discord.js-commando');
const Utils = require('../../core/utils.js');
const Discord = require('discord.js');

module.exports = class AcceptCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'accept',
            group: 'server',
            memberName: 'accept',
            description: 'Accept the server rules!',
            examples: ['accept']
        });
    }
	
	    async run(msg) {
			let guestRole = msg.guild.roles.find(role => role.name === "Guests");
			let residentRole = msg.guild.roles.find(role => role.name === "Residents");
			
			if(msg.member.roles.has(guestRole.id)) {
				msg.delete(1000);
				msg.member.removeRole(guestRole);
				msg.member.addRole(residentRole);
				const embedMsg = new Discord.RichEmbed()
						.setAuthor("House of Dragons", "https://i.imgur.com/CyAb3mV.png")
						.addField("Welcome!", "<@"+msg.author.id+"> has joined the House of Dragons!")
						.setThumbnail(msg.author.displayAvatarURL)
						
				this.client.channels.get('498945652114587651').send(embedMsg);
			} else {
				return msg.say("You have already accepted the rules!");
			}
		}
};