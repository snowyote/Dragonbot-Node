const {
    Command
} = require('discord.js-commando');
const Utils = require('../../core/utils.js');
const Discord = require('discord.js');

module.exports = class MemeCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'meme',
            group: 'fun',
            memberName: 'meme',
            description: 'Get a random meme',
            examples: ['meme']
        });
    }

    async run(msg) {
        var jsonObj = await Utils.webJson('https://www.reddit.com/r/memes/random/.json');
		const imgUrl = jsonObj['0']['data']['children']['0']['data']['url'];
		const imgTitle = jsonObj['0']['data']['children']['0']['data']['title'];
		const nsfw = jsonObj['0']['data']['children']['0']['data']['over_18'];
		const source = jsonObj['0']['data']['children']['0']['data']['permalink'];
		
		let embedMsg = new Discord.RichEmbed()
			.setTitle(imgTitle)
			.setImage(imgURL)
			.setURL(source)
		return msg.embed(embedMsg);
    };
}