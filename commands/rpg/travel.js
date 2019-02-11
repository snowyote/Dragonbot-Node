const {Command} = require('discord.js-commando');
const Utils = require('../../core/utils.js');
const BattleUtils = require('../../core/battleUtils.js');
const Discord = require('discord.js');
const { PerformanceObserver, performance } = require('perf_hooks');

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
		let t0 = performance.now();
		if(await Utils.isInBattle(msg.author)) {
			return msg.say("You're in a battle, finish that before using this command!");
		}
		if (this.battles.has(msg.channel.id)) return msg.reply('Please wait for the battle in this channel to end before moving!');
		let locType = "location";
		if(await Utils.isInDungeon(msg.author.id)) locType="dungeon_location";
		const userRes = await Utils.queryDB("SELECT * FROM users WHERE discordID="+msg.author.id);
		let coords = JSON.parse(userRes[0][locType]);
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
		
		let tiles;
		if(locType !== "dungeon_location") tiles = await Utils.queryDB("SELECT * FROM locations WHERE coords='"+JSON.stringify(movement)+"'");
		else tiles = await Utils.queryDB("SELECT * FROM locations_dungeon WHERE coords='"+JSON.stringify(movement)+"'");
		
		if(tiles && tiles.length) {
			if(tiles[0].type == 'Impassable') {
				return msg.say("You can't move that way, you're being blocked by **"+tiles[0].name+"**!");
			} else {
				let buffer;
				if(locType !== "dungeon_location") {
					buffer = await Utils.generateMap(movement[0], movement[1], msg.author);
					await Utils.queryDB("UPDATE users SET location='"+JSON.stringify(movement)+"' WHERE discordID="+msg.author.id);
				}
				else {
					buffer = await Utils.generateDungeonMap(movement[0], movement[1], msg.author);
					await Utils.queryDB("UPDATE users SET dungeon_location='"+JSON.stringify(movement)+"' WHERE discordID="+msg.author.id);
				}
				embedMsg.attachFiles(buffer);
				if(tiles[0].lore.length > 0) {
					embedMsg.addField(tiles[0].name, tiles[0].lore);
					embedMsg.addField("Options", await Utils.RPGOptions(msg.author));
				} else {
					embedMsg.addField(tiles[0].name, await Utils.RPGOptions(msg.author));
				}
				msg.embed(embedMsg);
				let t1 = performance.now();
				Utils.log("\x1b[45m%s\x1b[0m", "Generating map (by travel) took " + ((t1 - t0)/1000).toFixed(2) + " seconds!");
				let encounterChance = Utils.randomIntIn(1,100);
				let monsterToFight = await Utils.getRandomMonster(msg.author, true, true);
				if(locType == "dungeon_location") monsterToFight = await Utils.getRandomMonster(msg.author, true, false, false, true);
				if(monsterToFight > 0 && encounterChance <= 50)
					await BattleUtils.battle(msg, monsterToFight, this.battles, true);
			}
		} else {
			if(locType !== "dungeon_location") return msg.say("You can't move that way, the vast ocean is too treacherous for you to traverse currently!");
			else return msg.say("The large, thick walls of the dungeon block you from moving that way!");
		}
    };
}