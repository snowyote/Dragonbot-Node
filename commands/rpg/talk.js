const {Command} = require('discord.js-commando');
const Utils = require('../../core/utils.js');
const Discord = require('discord.js');

module.exports = class TalkCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'talk',
            group: 'rpg',
            memberName: 'talk',
            description: 'Talk to NPCs',
            examples: ['talk']
        });
    }

    async run(msg) {
		const embedMsg = new Discord.RichEmbed()
                  .setAuthor("World of the House of Dragons", "https://i.imgur.com/CyAb3mV.png")
				  
		var location = await Utils.getLocation(msg.author);
		
		const userRes = await Utils.queryDB("SELECT * FROM users WHERE discordID="+msg.author.id);
		const flagRes = await Utils.queryDB("SELECT * FROM rpg_flags WHERE userID="+userRes[0].id);
		if(!flagRes || !flagRes.length) {
			await Utils.queryDB("INSERT INTO rpg_flags(userID) VALUES("+userRes[0].id+")");
			flagRes = await Utils.queryDB("SELECT * FROM rpg_flags WHERE userID="+userRes[0].id);
			Utils.log("DB: Didn't find user ID "+userRes[0].id+" in rpg_flags, added!");
		}
		
		let x = location[0];
		let y = location[1];
		let userMention = "<@"+msg.author.id+">";
		
		// Dragonstone Village
		if(x==0 && y==0) {
			var timesTalked = flagRes[0].talk_dragonstone;
			var questsCompleted = flagRes[0].quests_dragonstone;
			var inProgress = flagRes[0].quest_in_progress;
			
			switch(timesTalked) {
				case 0:
					embedMsg.addField("Villager", "Hello, welcome to Dragonstone Village, "+userMention+"! I've lived here all my life. It's a fairly simple life here, we farm and chop wood from the local forest to build our houses and feed our families. If you want to buy something, check out the market here, our economy could use it!");
					timesTalked++;
					break;
				case 1:
					if(inProgress == 0)
						embedMsg.addField("Villager", "Hey "+userMention+", actually, I have something to ask of you.. do you think you could go to the forest down south and grab something for me? I'll make it worth your while. I left my **Bronze Axe** somewhere there, it shouldn't be too hard to find but the Mayor's got me working twice as hard today so I can't go myself. If you accept this, use `!quest 1`!");
					else if(await Utils.hasQuestItem(msg.author.id, 1)) {
						embedMsg.addField("Villager", "You found it! Thank you so much! For your reward.. uh, I have this valuable-looking key, but I'm not sure what it's for. I'm sure a brave adventurer like yourself could put it to use!");
						await Utils.addQuestItem(msg.author.id, 2);
						await Utils.removeQuestItem(msg.author.id, 1);
						timesTalked++;
						embedMsg.addField("Quest Completed", "You completed the quest **Axed to Find**!\nReward: **Antique Key** (Quest Item)");
					} else
						embedMsg.addField("Villager", "Don't you have something to do, "+userMention+"? I'll talk when you're done!");
					break;
				case 2:
					embedMsg.addField("Villager", "Hello "+userMention+"! Thank you for the help before, unfortunately I don't really have anything else I need. Have a good day, and stay safe out there! I'm going back to the fields before the Mayor gets angry at me.");
					timesTalked++;
					break;
				case 3:
					embedMsg.addField("Can't Talk", "No-one seems to want to talk to you here!");
					break;
			}
			
			await Utils.queryDB("UPDATE rpg_flags SET talk_dragonstone="+timesTalked+" WHERE userID="+userRes[0].id);
		} else {
			embedMsg.addField("Can't Talk", "There's no-one to talk to here!");
			break;
		}
		
		return msg.embed(embedMsg);
    };
}