const { Command } = require('discord.js-commando');
const Utils = require('../../core/utils.js');
const Discord = require('discord.js');

module.exports = class PollCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'poll',
            group: 'server',
            memberName: 'poll',
            description: 'Make a server poll!',
            examples: ['poll'],
			args: [
				{
					key: 'text',
					prompt: 'What would you like to poll for?',
					type: 'string'
				}
			]
        });
    }
	
	    async run(msg, {text}) {
			const embedMsg = new Discord.RichEmbed()
					.setAuthor("House of Dragons Poll", "https://i.imgur.com/CyAb3mV.png")
					.addField("Poll", "\""+text+"\"\n\n*Submitted by <@"+msg.author.id+">*")
					.setFooter("👍=Agree 👎=Disagree 👋=Maybe/Unsure")
					
			this.client.channels.get('528105021330423808').send(embedMsg)
				.then(function(message) {message.react("👍"); return message;})
				.then(function(message) {message.react("👎"); return message;})
				.then(function(message) {message.react("👋"); return message;})
				.catch(function(err) {
					Utils.log(err);
				});
		}
};