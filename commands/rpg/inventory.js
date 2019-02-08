const {Command} = require('discord.js-commando');
const Utils = require('../../core/utils.js');
const Discord = require('discord.js');

module.exports = class InventoryCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'inventory',
			aliases: ['inv'],
            group: 'rpg',
            memberName: 'inventory',
            description: 'View your inventory',
            examples: ['inventory']
        });
    }

    async run(msg) {
        let queryRes = await Utils.queryDB("SELECT * FROM users WHERE discordID=" + msg.author.id);
        Utils.log("\x1b[36m%s\x1b[0m", "DB: Selected user ID " + msg.author.id);
		var coins = queryRes[0].coins;
		var mysticOrbs = queryRes[0].mysticOrbs;
		var crateKeys = queryRes[0].crateKeys;
		var crates = JSON.parse(queryRes[0].crate);
		var food = queryRes[0].food;
		var artifacts = queryRes[0].artifacts;
		var trash = queryRes[0].trash;
		var gems = JSON.parse(queryRes[0].gems);
		var logs = JSON.parse(queryRes[0].logs);
        const itemRes = await Utils.queryDB("SELECT * FROM quest_items");
		var questItems = "";
		for(var i = 0; i < itemRes.length; i++) {
			if(await Utils.hasQuestItem(msg.author.id, itemRes[i].id)) {
				questItems = questItems + itemRes[i].name + ', ';
			}
		}
		
		if(questItems == "") questItems = "None";
		else questItems = questItems.slice(0, -2);
		
        const embedMsg = new Discord.RichEmbed()
            .setAuthor(msg.author.username+"'s Inventory", "https://i.imgur.com/CyAb3mV.png")
		
		embedMsg.addField("🐟 Food", "**"+food+"**", true);
		embedMsg.addField("🗑️ Trash", "**"+trash+"**", true);
		embedMsg.addField("🔑 Keys", "**"+crateKeys+"**", true);
		embedMsg.addField("💰 Coins", "**"+coins+"**", true);
		embedMsg.addField("🔮 Mystic Orbs", "**"+mysticOrbs+"**", true);
		embedMsg.addField("🏛️ Artifacts", "**"+artifacts+"**", true);
		embedMsg.addField("💎 Gems", "Shards: **"+gems[0]+"**\n"+
									"Chipped: **"+gems[1]+"**\n"+
									"Flawed: **"+gems[2]+"**\n"+
									"Flawless: **"+gems[3]+"**\n"+
									"Perfect: **"+gems[4]+"**", true);
		embedMsg.addField("🌳 Logs", "Oak: **"+logs[0]+"**\n"+
									"Pine: **"+logs[1]+"**\n"+
									"Palm: **"+logs[2]+"**\n"+
									"Festive: **"+logs[3]+"**\n"+
									"Spirit: **"+logs[4]+"**", true);
		embedMsg.addField("📦 Crates", "Wooden: **"+crates[0]+"**\n"+
									"Iron: **"+crates[1]+"**\n"+
									"Golden: **"+crates[2]+"**\n"+
									"Ancient: **"+crates[3]+"**\n"+
									"Celestial: **"+crates[4]+"**", true);
		embedMsg.addField("🌟 Quest Items", "**"+questItems+"**", true);
		return msg.embed(embedMsg);
    };
}