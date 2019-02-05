const { Command } = require('discord.js-commando');
const Utils = require('../../core/utils.js');
const Discord = require('discord.js');

module.exports = class SuggestCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'suggest',
            group: 'server',
            memberName: 'suggest',
            description: 'Make a server suggestion!',
            examples: ['suggest'],
			args: [
				{
					key: 'text',
					prompt: 'What would you like to suggest?',
					type: 'string'
				}
			]
        });
    }
	
	    async run(msg, {text}) {
			const embedMsg = new Discord.RichEmbed()
					.setAuthor("House of Dragons Suggestion", "https://i.imgur.com/CyAb3mV.png")
					.addField("Suggestion", "\""+text+"\"\n\n*Submitted by <@"+msg.author.id+">*")
					.setFooter("👍=Agree 👎=Disagree 👋=Maybe/Unsure")
					
			this.client.channels.get('528110581517910016').send(embedMsg)
				.then(function(message) {message.react("👍"); return message;})
				.then(function(message) {message.react("👎"); return message;})
				.then(function(message) {message.react("👋"); return message;})
				.catch(function(err) {
					Utils.log(err);
				});
		}
};