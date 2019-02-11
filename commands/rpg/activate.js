const {
    Command
} = require('discord.js-commando');
const Utils = require('../../core/utils.js');
const Discord = require('discord.js');

module.exports = class ActivateCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'activate',
			group: 'rpg',
			memberName: 'activate',
			description: 'Activate a waypoint',
            examples: ['activate id'],
            args: [{
                    key: 'id',
                    prompt: 'Which waypoint do you want?',
                    type: 'integer',
                    default: ''
                }
            ]
		});
		
		this.battles = new Map();
	}

	async run(msg, {id}) {
		if(await Utils.isInBattle(msg.author)) {
			return msg.say("You're in a battle, finish that before using this command!");
		}
		const embedMsg = new Discord.RichEmbed()
			.setAuthor("World of the House of Dragons", "https://i.imgur.com/CyAb3mV.png")
			
		if(await Utils.canUseAction(msg.author, 'activate')) {
			let waypointLocation = await Utils.getLocID(msg.author);
			if(await Utils.hasWaypoint(msg.author.id, waypointLocation) == false) {
				await Utils.activateWaypoint(msg.author, waypointLocation);
			}
			
			if(!id) {
				let str = await Utils.listWaypoints(msg.author.id);
				embedMsg.addField("Where would you like to go?", str);
				embedMsg.setFooter("!activate <id>");
				return msg.embed(embedMsg);
			} else {
				if(await Utils.hasWaypoint(msg.author.id, id)) {
					await Utils.teleport(msg.author.id, 0, 0, true, await Utils.getLocCoords(id));
					return msg.embed(Utils.makeRPGEmbed("Waypoint Activated", "You teleported to another waypoint!"));
				}
			}
		} else {
			embedMsg.addField("Can't Use Waypoint", "There's no waypoint here, find one on the `!map`!");
			return msg.embed(embedMsg);
		}
	};
}