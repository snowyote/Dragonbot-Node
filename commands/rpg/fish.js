const { Command } = require('discord.js-commando');
const Utils = require('../../core/utils.js');
const Discord = require('discord.js');
const times = {
	'1': 3000,
	'2': 2000,
	'3': 1000
};

module.exports = class FishCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'fish',
			group: 'rpg',
			memberName: 'fish',
			description: 'Go fishing.'
		});
	}
	
	async run(msg) {
		if(await Utils.isInBattle(msg.author)) {
			return msg.say("You're in a battle, finish that before using this command!");
		}
		const embedMsg = new Discord.RichEmbed()
			.setAuthor("World of the House of Dragons", "https://i.imgur.com/CyAb3mV.png")
			
		if(await Utils.canUseAction(msg.author, 'fish')) {
			let fishing = true;
			embedMsg.addField("Fishing", "You are now fishing. Type `reel` as soon as something bites, and `stop` to stop fishing!");
			await msg.embed(embedMsg);
			while(fishing) {
				let stopFishing = false;
				let timeUntilFish = Utils.randomIntIn(2000,30000);
				setTimeout(stopFishing = await this.awaitStop(msg, timeUntilFish), 0);
				if(stopFishing) {
					fishing = false;
					break;
				}
				setTimeout(await this.fishBite(msg), timeUntilFish);
			}
		} else {
			embedMsg.addField("Can't Fish", "There's nowhere to fish here, find a lake or ocean on the `!map`!");
			return msg.embed(embedMsg);
		}
	}
	
	async fishBite(msg) {
		await msg.embed(Utils.makeRPGEmbed("Something's Biting!", "Type **reel** quickly to catch it!"));
		let randomTime = Utils.randomIntEx(0, times.length);
		const time = times[randomTime];
		const msgs = await msg.channel.awaitMessages(res => res.author.id === msg.author.id, {
			max: 1,
			time: time
		});
		if (!msgs.size || msgs.first().content !== 'reel') return msg.reply('The fish got away!');
		// Do fish logic here!
		return msg.reply('You caught a fish!');
	};
	
	async awaitStop(msg, time) {
		const msgs = await msg.channel.awaitMessages(res => res.author.id === msg.author.id, {
			max: 1,
			time: time
		});
		if (msgs.content && msgs.first().content == 'stop') {
			await msg.embed(Utils.makeRPGEmbed("Stopped Fishing", "You stopped fishing!"));
			return true;
		}
		else return false;
	}
}