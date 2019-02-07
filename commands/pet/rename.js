const {
    Command
} = require('discord.js-commando');
const Utils = require('../../core/utils.js');
const Discord = require('discord.js');

module.exports = class RenameCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'rename',
            group: 'pet',
            memberName: 'rename',
            description: 'Rename your active pet',
            examples: ['rename <name>'],
            args: [{
                key: 'name',
                prompt: 'What name do you want for your pet?',
                type: 'string',
                validate: text => {
                    if (text.match(/^[\w\-\s]+$/) && text.length < 20 && text.length > 0) return true;
                    return 'That name is too long or contains special characters!';
                }
            }]
        });
    }

    async run(msg, {
        name
    }) {
        const embedMsg = new Discord.RichEmbed()
            .setAuthor("Pet Center", "https://i.imgur.com/CyAb3mV.png")
            .setColor("#FDF018")

        const petIDs = await Utils.queryDB("SELECT activePet FROM users WHERE discordID=" + msg.author.id);
        var aPet = parseInt(petIDs[0].activePet);
        if (petIDs.length > 0) {
            embedMsg.addField("Name Changed", "Your pet's name was successfully changed to **" + name + "**!");
            await Utils.queryDB("UPDATE pets SET name='" + name + "' WHERE id=" + aPet);
			return msg.embed(embedMsg);
        } else {
            embedMsg.addField("Notice", "You don't have any pets! Get one with `!adopt`!");
			return msg.embed(embedMsg);
        }
    };
}