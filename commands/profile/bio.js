const {Command} = require('discord.js-commando');
const Utils = require('../../core/utils.js');
const Discord = require('discord.js');
const Jimp = require('jimp');

module.exports = class BioCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'bio',
            group: 'profile',
            memberName: 'bio',
            description: 'Change your profile bio',
            examples: ['bio <string>'],
			args: [
				{
					key: 'biography',
					prompt: 'What do you want your biography to be?',
					type: 'string',
					validate: text => {
						if (text.length < 110) return true;
						return 'Bio needs to be less than 110 characters!';
					}
				}
			]
        });
    }

    async run(msg, {biography}) {
		await Utils.queryDB("UPDATE users SET bio='"+biography+"' WHERE discordID="+msg.author.id);
		return msg.say("Your biography has been updated to `"+biography+"`!");
    };
}