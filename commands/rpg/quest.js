const {Command} = require('discord.js-commando');
const Utils = require('../../core/utils.js');
const Discord = require('discord.js');

module.exports = class QuestCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'quest',
            group: 'rpg',
            memberName: 'quest',
            description: 'Accept a quest',
            examples: ['quest <id>'],
			args: [
				{
					key: 'id',
					prompt: 'Which quest ID do you want to accept?',
					type: 'integer',
					min: 1,
					default: ''
				}
			]
        });
    }

    async run(msg, {id}) {
		const embedMsg = new Discord.RichEmbed()
                  .setAuthor("World of the House of Dragons", "https://i.imgur.com/CyAb3mV.png")
		
		const userRes = await Utils.queryDB("SELECT * FROM users WHERE discordID="+msg.author.id);
		const flagRes = await Utils.queryDB("SELECT * FROM rpg_flags WHERE userID="+userRes[0].id);
		if(id > 0) {
			const questRes = await Utils.queryDB("SELECT * FROM quests WHERE id="+id);
			if(!flagRes || !flagRes.length) {
				await Utils.queryDB("INSERT INTO rpg_flags(userID) VALUES("+userRes[0].id+")");
				flagRes = await Utils.queryDB("SELECT * FROM rpg_flags WHERE userID="+userRes[0].id);
				Utils.log("DB: Didn't find user ID "+userRes[0].id+" in rpg_flags, added!");
			}
			
			if(!questRes || !questRes.length) {
				embedMsg.addField("Invalid Quest", "That quest doesn't exist!");
				return msg.embed(embedMsg);
			}
			
			if(await Utils.hasCompletedQuest(msg.author.id, id)) {
				embedMsg.addField("Already Completed", "You have already completed this quest!");
				return msg.embed(embedMsg);
			}
			
			if(flagRes[0][questRes[0].requiredFlag] >= questRes[0].requiredNum) {
				if(flagRes[0].quest_in_progress == 0) {
					embedMsg.addField("Accepted Quest", "You've accepted the quest **"+questRes[0].name+"**!\n*"+questRes[0].description+"*");
					await Utils.queryDB("UPDATE rpg_flags SET quest_in_progress="+id+" WHERE userID="+userRes[0].id);
					return msg.embed(embedMsg);
				} else {
					embedMsg.addField("Can't Accept Quest", "You've already accepted a quest, finish that one first!");
					return msg.embed(embedMsg);
				}
			} else {
				embedMsg.addField("Can't Accept Quest", "You don't meet the requirements for this quest! Are you sure you selected the right one?");
				return msg.embed(embedMsg);
			}
		} else {
			if(flagRes[0].quest_in_progress > 0) {
				const questRes = await Utils.queryDB("SELECT * FROM quests WHERE id="+flagRes[0].quest_in_progress);
				embedMsg.addField("Current Quest", "**Name:** "+questRes[0].name+"\n**Objectives:** "+questRes[0].description);
				return msg.embed(embedMsg);
			} else {
				embedMsg.addField("No Active Quests", "You don't have any active quests! Explore the world to find one!");
				return msg.embed(embedMsg);
			}
		}
    };
}