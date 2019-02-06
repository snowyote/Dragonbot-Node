const {
    Command
} = require('discord.js-commando');
const Utils = require('../../core/utils.js');
const Discord = require('discord.js');
const {JSONPath} = require('jsonpath-plus');

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
		console.log(jsonObj);
		const imgUrl = JSONPath({path: '$.["data"].["children"].["data"].url', json: jsonObj});
		const imgTitle = JSONPath({path: '$.0.["children"].["data"].title', json: jsonObj});
		const nsfw = JSONPath({path: '$.0.["children"].["data"].over_18', json: jsonObj});
		const source = JSONPath({path: '$.0.["children"].["data"].permalink', json: jsonObj});
		
		let embedMsg = new Discord.RichEmbed()
			.setTitle(imgTitle)
			.setImage(imgURL)
			.setURL(source)
		return msg.embed(embedMsg);
    };
}