const {
    Command
} = require('discord.js-commando');
const Utils = require('../../core/utils.js');
const Discord = require('discord.js');

module.exports = class MysticismCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'mysticism',
            group: 'rpg',
            memberName: 'mysticism',
            description: 'Call upon the power of the mystic tree!',
            examples: ['mysticism id'],
            args: [{
                    key: 'id',
                    prompt: 'Which mysticism do you want?',
                    type: 'integer',
                    default: ''
                }
            ]
        });
    }

    async run(msg, {id}) {
		if(await Utils.isInBattle(msg.author)) {
			return msg.say("You're in a battle, finish that before using this command!");
		}
		const embedMsg = new Discord.RichEmbed()
            .setAuthor("House of Dragons Notice", "https://i.imgur.com/CyAb3mV.png")
		if(await Utils.canUseAction(msg.author, 'mysticism')) {
			let queryRes = await Utils.queryDB("SELECT * FROM users WHERE discordID=" + msg.author.id);
			var userID = queryRes[0].id;
			Utils.log("\x1b[36m%s\x1b[0m", "DB: Selected user ID " + msg.author.id);
			var active = queryRes[0].activePet;
			if (active > 0) {
				const petRes = await Utils.queryDB("SELECT * FROM pets WHERE id=" + active);
				Utils.log("\x1b[36m%s\x1b[0m", "DB: Selected pet ID " + active);
				if (petRes[0].isEgg == 0) {
						if (!id) {
							embedMsg.addField("1: Pet Rebirth", "Reset all of your pet's perks to 0 and return all affection points!");
							embedMsg.addField("2: Rebirth", "Reset all of your skills to 0 and return all stat points!");
							embedMsg.setFooter("!mysticism <number> - to  call upon the power of the mystic tree!")
							return msg.embed(embedMsg);
						} else {
								var currentLevel = petRes[0].level;
								switch (id) {
									case 1:
										await Utils.queryDB("UPDATE pets SET luck=0, exp=0, intelligence=0, hunting=0, mining=0, avarice=0, maxStamina=100, stamina=100, skillPoints=" + (currentLevel - 1) + " WHERE id=" + active);
										embedMsg.addField("Mysticism Applied", "Your pet's skills have been reset!");
										return msg.embed(embedMsg);
										break;
									case 2:
										var amount = 1;
										await Utils.queryDB("UPDATE users SET prowess=0, fortitude=0, precise=0, vitality=0, arcana=0, impact=0, agility=0 WHERE discordID=" + msg.author.id);
										embedMsg.addField("Mysticism Applied", "Your skills have been reset!");
										return msg.embed(embedMsg);
										break;
									default:
										embedMsg.addField("Can't Use Power", "That wasn't a valid mysticism! Try `1`, `2`, `3`, or `4`!");
										return msg.embed(embedMsg);
										break;
								}
						}
				} else {
					embedMsg.addField("Not Ready", "This pet hasn't been hatched yet, use `!hatch` to check up on it!");
					return msg.embed(embedMsg);
				}
			} else {
				embedMsg.addField("No Pet", "You don't have a pet, get one using `!adopt`!");
				return msg.embed(embedMsg);
			}
		} else {
			embedMsg.addField("Can't Use Mysticism", "You need to be nearby the mystic tree, find it on the `!map`!");
			return msg.embed(embedMsg);
		}
    };
}