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
		let level = await Utils.getLevel(msg.author.id);
		let x = location[0];
		let y = location[1];
		let userMention = "<@"+msg.author.id+">";
		if(await Utils.canUseAction(msg.author, 'talk')) {
			// Dragonstone Village
			if(x==0 && y==-1) {
				var timesTalked = flagRes[0].talk_dragonstone;
				var questsCompleted = flagRes[0].quests_dragonstone;
				var inProgress = flagRes[0].quest_in_progress;
				
				switch(timesTalked) {
					case 0:
						embedMsg.addField("Villager", "Hello, welcome to Dragonstone Village, "+userMention+"! I've lived here all my life. It's a fairly simple life here, we farm and chop wood from the local forest to build our houses and feed our families. If you want to buy something, check out the market here, our economy could use it!");
						timesTalked++;
						break;
					case 1:
						if(inProgress == 0) {
							embedMsg.addField("Villager", "Hey "+userMention+", actually, I have something to ask of you.. do you think you could go to the forest down south and grab something for me? I'll make it worth your while. I left my **Bronze Axe** somewhere there, it shouldn't be too hard to find but the Mayor's got me working twice as hard today so I can't go myself. If you accept this, use `!quest 1`!");
							break;
						}
						else if(await Utils.hasQuestItem(msg.author.id, 1) && inProgress == 1) {
							embedMsg.addField("Villager", "You found it! Thank you so much! For your reward.. I talked the mayor into giving me a spare logging permit, with this you're able to use the forests to gather resources!");
							timesTalked++;
							msg.channel.send(await Utils.completeQuest(msg.author.id, 1));
							break;
						} else
							embedMsg.addField("Villager", "Don't you have something to do, "+userMention+"? I'll talk when you're done!");
						break;
					case 2:
						if(inProgress == 0) {
							embedMsg.addField("Potion Seller", "Hello "+userMention+"! I'm afraid I need some help, my last shipment of herbs was delayed and I need them urgently. Could you get me 10 special herbs? If so, use `!quest 5`!");
							break;
						}
						else if(await Utils.hasMaterial(msg.author.id, 29) >= 10 && inProgress == 5) {
							embedMsg.addField("Potion Seller", "Yes! That's great, thank you! Here, have one of my spare Alembics - it's a kind of distilling vessel for making potions, maybe you can find a use for it.");
							timesTalked++;
							msg.channel.send(await Utils.completeQuest(msg.author.id, 5));
							break;
						} else
							embedMsg.addField("Potion Seller", "Looks like we're both busy. I'll talk to you when you're done.");
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
						if(inProgress == 0) {
							embedMsg.addField("Quarry Guard", "Actually.. if you'd like to help us deal with the goblins, I can see about letting you in. We just need a Goblin's head to scare off any other invaders. If you accept this, use `!quest 2`!");
							break;
						}
						else if(await Utils.hasQuestItem(msg.author.id, 3)) {
							embedMsg.addField("Quarry Guard", "Oh! You got it! Good job, adventurer. Now I'll just put this on a spike outside of the quarry and those pesky goblins should stay clear of here. In return, I'll give you access to the mine - and here's my own pickaxe for you to use!");
							timesTalked++;
							msg.channel.send(await Utils.completeQuest(msg.author.id, 2));
							break;
						} else
							embedMsg.addField("Quarry Guard", "You look like you should be doing something, get to it, adventurer!");
						break;
					case 2:
						embedMsg.addField("Can't Talk", "No-one seems to want to talk to you here!");
						break;
				}
				
				await Utils.queryDB("UPDATE rpg_flags SET talk_quarry="+timesTalked+" WHERE userID="+userRes[0].id);
			} 
			
			// Taposa
			else if(x==-5 && y==1) {
				var timesTalked = flagRes[0].talk_taposa;
				var questsCompleted = flagRes[0].quests_taposa;
				var inProgress = flagRes[0].quest_in_progress;
				
				switch(timesTalked) {
					case 0:
						embedMsg.addField("Taposa Treasurer", "Hello, "+userMention+". Welcome to our humble town of Taposa! I have a job that might be perfect for an adventurer such as yourself, what do you say?");
						timesTalked++;
						break;
					case 1:
						if(inProgress == 0) {
							embedMsg.addField("Taposa Treasurer", "Some bandits recently broke into the treasury and stole quite a lot of gold and resources from our town. We have reason to believe they're hiding out at the fortress to the north-east, though we're not sure. You will be greatly rewarded if you help us retrieve this stolen gold! If you accept, use `!quest 4`.");
							break;
						}
						else if(await Utils.hasQuestItem(msg.author.id, 7)) {
							embedMsg.addField("Taposa Treasurer", "The gold, you found it! I knew we could trust you! As promised, here's your reward, 15,000 coins - your share.");
							timesTalked++;
							msg.channel.send(await Utils.completeQuest(msg.author.id, 4));
							break;
						} else
							embedMsg.addField("Taposa Treasurer", "Hm? You look busy, I'll talk with you later.");
						break;
					case 2:
						embedMsg.addField("Can't Talk", "No-one seems to want to talk to you here!");
						break;
				}
				
				await Utils.queryDB("UPDATE rpg_flags SET talk_taposa="+timesTalked+" WHERE userID="+userRes[0].id);
			} 
			
			// Hell's Point Town
			else if(x==2 && y==6) {
				var timesTalked = flagRes[0].talk_hells_point;
				var inProgress = flagRes[0].quest_in_progress;
				
				switch(timesTalked) {
					case 0:
						embedMsg.addField("Silence...", "There is no-one here but dead trees and silence.");
						break;
				}
				
				await Utils.queryDB("UPDATE rpg_flags SET talk_quarry="+timesTalked+" WHERE userID="+userRes[0].id);
			} 
			
			// Dragonstone Palace
			else if(x==0 && y==4) {
				var timesTalked = flagRes[0].talk_dragonstone_palace;
				var inProgress = flagRes[0].quest_in_progress;
				
				switch(timesTalked) {
					case 0:
						embedMsg.addField("The Emperor", "So, you seek audience with me? We're currently dealing with some issues.. namely, the catacombs to the north-east seem to be cursed; monsters keep coming out of there and attacking my palace! Care to listen to my offer?");
						timesTalked++;
						break;
					case 1:
						if(level >= 15) {
							timesTalked++;
						} else {
							embedMsg.addField("The Emperor", "Hmm.. on second thought, you may not be ready for this. Come back when you're stronger.");
							break;
						}
					case 2:
						if(inProgress == 0) {
							embedMsg.addField("The Emperor", "The soul of an ancient king resides in the catacombs, and some evil force has awoken him. If you're up to the challenge, go into the catacombs and retrieve his crown for me. Use `!quest 3` if you accept.");
							break;
						}
						else if(await Utils.hasQuestItem(msg.author.id, 5)) {
							embedMsg.addField("The Emperor", "You.. defeated him! I will say, I doubted your power when you came in here, but you've clearly shown your worth to me and the empire. Have this note from me, any guards that would block you access to anywhere in this land will now let you through, just show them this.");
							timesTalked++;
							msg.channel.send(await Utils.completeQuest(msg.author.id, 3));
							break;
						} else {
							embedMsg.addField("The Emperor", "Shouldn't you be doing something?");
						}
						break;
					case 3:
						embedMsg.addField("The Emperor", "Ah, the brave adventurer! Unfortunately I have no more tasks for you, but know we're all grateful for how you saved our land.");
						break;
				}
				
				await Utils.queryDB("UPDATE rpg_flags SET talk_dragonstone_palace="+timesTalked+" WHERE userID="+userRes[0].id);
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