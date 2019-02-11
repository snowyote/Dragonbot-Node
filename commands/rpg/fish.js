const { Command } = require('discord.js-commando');
const Utils = require('../../core/utils.js');
const Discord = require('discord.js');

module.exports = class FishCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'fish',
			group: 'rpg',
			memberName: 'fish',
			description: 'Go fishing.'
		});
		
		this.fishing = new Map();
	}
	
	async run(msg) {
		if(await Utils.isInBattle(msg.author)) {
			return msg.say("You're in a battle, finish that before using this command!");
		}
		
		if (this.fishing.has(msg.author.id)) return msg.reply('You are already fishing!');
		
		const embedMsg = new Discord.RichEmbed()
			.setAuthor("World of the House of Dragons", "https://i.imgur.com/CyAb3mV.png")
			
		if(await Utils.canUseAction(msg.author, 'fish')) {
			this.fishing.set(msg.author.id, true);
			embedMsg.addField("Fishing", "You are now fishing. Type `reel` as soon as something bites!");
			await msg.embed(embedMsg);
			let stopFishing = false;
			let timeUntilFish = Utils.randomIntIn(2000,20000);
			let fishTime = Utils.randomIntIn(500,2000);
			console.log(timeUntilFish);
			await Utils.delay(timeUntilFish);
			await msg.embed(Utils.makeRPGEmbed("Something's Biting!", "Type **reel** quickly to catch it!"));
			let msgs = await msg.channel.awaitMessages(res => res.author.id === msg.author.id, {
				max: 1,
				time: fishTime
			});
			if (!msgs.size || msgs.first().content !== 'reel') {
				await msg.embed(Utils.makeRPGEmbed("Got Away!", "Whatever was biting got away!"));
			} else {
				await msg.reply('You caught a fish!');
			}
			this.fishing.delete(msg.author.id);
		} else {
			embedMsg.addField("Can't Fish", "There's nowhere to fish here, find a lake or ocean on the `!map`!");
			return msg.embed(embedMsg);
		}
	}
}