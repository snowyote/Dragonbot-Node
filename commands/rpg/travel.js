const {Command} = require('discord.js-commando');
const Utils = require('../../core/utils.js');
const BattleUtils = require('../../core/battleUtils.js');
const Discord = require('discord.js');

module.exports = class TravelCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'travel',
            group: 'rpg',
            memberName: 'travel',
            description: 'Travel in the world',
            examples: ['travel north/east/south/west'],
			args: [
				{
					key: 'direction',
					prompt: 'Which direction? (north/east/south/west)',
					type: 'string',
					oneOf: ['north', 'east', 'south', 'west']
				}
			]
        });
		
		this.battles = new Map();
    }

    async run(msg, {direction}) {
		if(await Utils.isInBattle(msg.author)) {
			return msg.say("You're in a battle, finish that before moving!");
		}
		const userRes = await Utils.queryDB("SELECT * FROM users WHERE discordID="+msg.author.id);
		let coords = JSON.parse(userRes[0].location);
		let movement = coords;
		switch(direction) {
			case 'north':
				movement[1]--;
				break;
			case 'east':
				movement[0]++;
				break;
			case 'south':
				movement[1]++;
				break;
			case 'west':
				movement[0]--;
				break;
		}
		
		const embedMsg = new Discord.RichEmbed()
                  .setAuthor("World of the House of Dragons ["+movement[0]+","+movement[1]+"]", "https://i.imgur.com/CyAb3mV.png")
		
		const tiles = await Utils.queryDB("SELECT * FROM locations WHERE coords='"+JSON.stringify(movement)+"'");
		if(tiles && tiles.length) {
			if(tiles[0].type == 'impassable') {
				return msg.say("You can't move that way, you're being blocked by **"+tiles[0].name+"**!");
			} else {
				let buffer = await Utils.generateMap(movement[0], movement[1], msg.author);
				embedMsg.attachFiles(buffer);
				if(tiles[0].lore.length > 0) {
					embedMsg.addField(tiles[0].name, tiles[0].lore);
					embedMsg.addField("Options", await Utils.RPGOptions(JSON.stringify(movement)));
				} else {
					embedMsg.addField(tiles[0].name, await Utils.RPGOptions(JSON.stringify(movement)));
				}
				await Utils.queryDB("UPDATE users SET location='"+JSON.stringify(movement)+"' WHERE discordID="+msg.author.id);
				msg.embed(embedMsg);
				let encounterChance = Utils.randomIntIn(1,100);
				let monsterToFight = await Utils.getRandomMonster(msg.author);
				if(monsterToFight > 0 && encounterChance <= 20)
					await BattleUtils.battle(msg, monsterToFight, this.battles, true);
			}
		} else {
			return msg.say("You can't move that way, the vast ocean is too treacherous for you to traverse currently!");
		}
    };
}