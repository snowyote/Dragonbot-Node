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
		let flagRes = await Utils.queryDB("SELECT * FROM rpg_flags WHERE userID="+userRes[0].id);
		if(!flagRes || !flagRes.length) {
			await Utils.queryDB("INSERT INTO rpg_flags(userID) VALUES("+userRes[0].id+")");
			flagRes = await Utils.queryDB("SELECT * FROM rpg_flags WHERE userID="+userRes[0].id);
			Utils.log("DB: Didn't find user ID "+userRes[0].id+" in rpg_flags, added!");
		}
		
		let x = location[0];
		let y = location[1];
		let userMention = "<@"+msg.author.id+">";
		if(await Utils.canUseAction(msg.author, 'talk')) {
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
						else if(await Utils.hasQuestItem(msg.author.id, 1) && inProgress == 1) {
							embedMsg.addField("Villager", "You found it! Thank you so much! For your reward.. I talked the mayor into giving me a spare logging permit, with this you're able to use the forests to gather resources!");
							timesTalked++;
							msg.channel.send(await Utils.completeQuest(msg.author.id, 1));
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
			} 
			
			// The Catacombs
			else if(x==1 && y==0) {
				var timesTalked = flagRes[0].talk_catacombs;
				var questsCompleted = flagRes[0].quests_catacombs;
				var inProgress = flagRes[0].quest_in_progress;
				
				switch(timesTalked) {
					case 0:
						embedMsg.addField("Guard", "You're not supposed to be here. Unless you have some kind of **written permission from the Mayor**, I can't let you in.");
						timesTalked++;
						break;
					case 1:
						embedMsg.addField("Guard", "I told you, "+userMention+". I can't let you in unless you have **written permission from the Mayor**.");
						break;
				}
				
				await Utils.queryDB("UPDATE rpg_flags SET talk_catacombs="+timesTalked+" WHERE userID="+userRes[0].id);
			} 
			
			// The Quarry
			else if(x==1 && y==2) {
				var timesTalked = flagRes[0].talk_quarry;
				var questsCompleted = flagRes[0].quests_quarry;
				var inProgress = flagRes[0].quest_in_progress;
				
				switch(timesTalked) {
					case 0:
						embedMsg.addField("Quarry Guard", "Hello, "+userMention+". Welcome to the Dragonstone Quarry. Unfortunately, I can't let you in right now - we're dealing with an invasion of goblins to the east. *Sigh*. Again.");
						timesTalked++;
						break;
					case 1:
						if(inProgress == 0)
							embedMsg.addField("Quarry Guard", "Actually.. if you'd like to help us deal with the goblins, I can see about letting you in. We just need a Goblin's head to scare off any other invaders. If you accept this, use `!quest 2`!");
						else if(await Utils.hasQuestItem(msg.author.id, 3)) {
							embedMsg.addField("Quarry Guard", "Oh! You got it! Good job, adventurer. Now I'll just put this on a spike outside of the quarry and those pesky goblins should stay clear of here. In return, I'll give you access to the mine - and here's my own pickaxe for you to use!");
							timesTalked++;
							msg.channel.send(await Utils.completeQuest(msg.author.id, 2));
						} else
							embedMsg.addField("Quarry Guard", "You look like you should be doing something, get to it, adventurer!");
						break;
					case 2:
						embedMsg.addField("Can't Talk", "No-one seems to want to talk to you here!");
						break;
				}
				
				await Utils.queryDB("UPDATE rpg_flags SET talk_quarry="+timesTalked+" WHERE userID="+userRes[0].id);
			} 
			
			// Hell's Point Town
			else if(x==2 && y==6) {
				var timesTalked = flagRes[0].talk_hells_point;
				
				switch(timesTalked) {
					case 0:
						embedMsg.addField("Silence...", "There is no-one here but dead trees and silence.");
						break;
				}
				
				await Utils.queryDB("UPDATE rpg_flags SET talk_quarry="+timesTalked+" WHERE userID="+userRes[0].id);
			} 
			
			// Goblin Hideout
			else if(x==2 && y==2) {
				var timesTalked = flagRes[0].talk_goblin_hideout;
				var inProgress = flagRes[0].quest_in_progress;
				
				switch(timesTalked) {
					case 0:
						embedMsg.addField("Angery Goblin", "YOU LEAVE NOW *REE*");
						timesTalked++;
						break;
					case 1:
						embedMsg.addField("Angery Goblin", "*screaming goblin noises*");
						timesTalked++;
						break;
					case 2:
						embedMsg.addField("Angery Goblin", "BE GONE HUMAN THOT");
						timesTalked++;
						break;
					case 3:
						embedMsg.addField("Angery Goblin", "*WHY YOU STILL HERE? GO NOW*");
						timesTalked++;
						break;
				}
				
				await Utils.queryDB("UPDATE rpg_flags SET talk_goblin_hideout="+timesTalked+" WHERE userID="+userRes[0].id);
			} else {
				embedMsg.addField("Can't Talk", "There's no-one to talk to here!");
			}
		}
		else {
			embedMsg.addField("Can't Talk", "There's no-one to talk to here!");
		}
		
		return msg.embed(embedMsg);
    };
}