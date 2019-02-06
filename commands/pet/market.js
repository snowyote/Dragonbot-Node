const {
    Command
} = require('discord.js-commando');
const Utils = require('../../core/utils.js');
const Discord = require('discord.js');

module.exports = class MarketCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'market',
            group: 'pet',
            memberName: 'market',
            description: 'Buy items or services',
            examples: ['market'],
            args: [
			{
                key: 'id',
                prompt: 'What ID to buy?',
                type: 'integer',
				min: 1,
				default: ''
			},
			{
                key: 'amount',
                prompt: 'How many?',
                type: 'integer',
				min: 1,
				default: ''
			}]
        });
    }

    async run(msg, {id,amount}) {
		const embedMsg = new Discord.RichEmbed()
            .setAuthor("House of Dragons Notice", "https://i.imgur.com/CyAb3mV.png")
			.setDescription("<@"+msg.author.id+">")

        let queryRes = await Utils.queryDB("SELECT * FROM users WHERE discordID=" + msg.author.id);
        var coins = queryRes[0].coins;
		var userID = queryRes[0].id;
		var income = queryRes[0].income;
		var active = queryRes[0].activePet;
        let petRes = await Utils.queryDB("SELECT * FROM pets WHERE id="+active);
		var tools = JSON.parse(queryRes[0].tools);
        Utils.log("\x1b[36m%s\x1b[0m", "DB: Selected user ID " + msg.author.id);
        const marketRes = await Utils.queryDB("SELECT * FROM market");
        if (!id) {
            var str = "";
            for (var i = 0; i < marketRes.length; i++) {
				if(marketRes[i].userVar == "coffee") {
					str = str + "[**" + (i+1) + "**] " + marketRes[i].icon + " " + marketRes[i].name + " - (" + (marketRes[i].cost+(petRes[0].timesDrankCoffee*10000)) + " coins)\n";
				}
				else if(marketRes[i].userVar == "income") {
					str = str + "[**" + (i+1) + "**] " + marketRes[i].icon + " " + marketRes[i].name + " - (" + (marketRes[i].cost*income) + " coins)\n";
				} else {
					str = str + "[**" + (i+1) + "**] " + marketRes[i].icon + " " + marketRes[i].name + " - (" + marketRes[i].cost + " coins)\n";
				}
            }
            str = str.slice(0, -1);
            embedMsg.addField("Marketplace", str);
            embedMsg.setFooter("hod?market <number> [amount] - to buy an item!");
            return msg.embed(embedMsg);
        } else {
                var selectedBuy = id;
                if (selectedBuy >= 1 && selectedBuy <= marketRes.length) {
					selectedBuy -= 1;
					if(!amount) amount = 1;
                    var name = marketRes[selectedBuy].name;
                    var cost = marketRes[selectedBuy].cost;
					if(marketRes[selectedBuy].userVar == "coffee") cost = (marketRes[selectedBuy].cost+(petRes[0].timesDrankCoffee*10000));
                    var icon = marketRes[selectedBuy].icon;
                    var userVar = marketRes[selectedBuy].userVar;
                    var quantity = marketRes[selectedBuy].quantity;
					if(userVar == "coffee") {
						if(coins >= cost) {
							var maxStamina = petRes[0].maxStamina;
							await Utils.queryDB("UPDATE pets SET isSleeping=0, sleepTime=0, stamina="+maxStamina+", timesDrankCoffee=timesDrankCoffee+1 WHERE id="+active);
							embedMsg.addField("Bought Coffee", "Your active pet has been returned to full stamina and woken up for **"+cost+"** coins!");
							await Utils.takeCoins(msg.author.id, cost);
							return msg.embed(embedMsg);
						} else {
							embedMsg.addField("Can't Buy", "You don't have the **" + cost + "** coins needed!");
							return msg.embed(embedMsg);
						}
					} else if(userVar == "income") {
						cost = (marketRes[selectedBuy].cost*income);
						if(coins >= cost) {
							var maxStamina = petRes[0].maxStamina;
							await Utils.queryDB("UPDATE users SET income=income+1 WHERE discordID="+msg.author.id);
							embedMsg.addField("Increased Income", "You have multiplied your daily coin bonus by **x"+(income+1)+"**!");
							await Utils.takeCoins(msg.author.id, cost);
							return msg.embed(embedMsg);
						} else {
							embedMsg.addField("Can't Buy", "You don't have the **" + cost + "** coins needed!");
							return msg.embed(embedMsg);
						}
					} else if(userVar == "tools") {
						Utils.log("\x1b[36m%s\x1b[0m", "DB: Tools: "+tools);
						var hasTool = 0;
						for(var i = 0; i < tools.length; i++) {
							if(parseInt(tools[i]) == quantity) {
								hasTool = 1;
							}
						}
						
						if(hasTool == 1) {
							embedMsg.addField("Can't Buy", "You already have the **"+name+"**!");
							return msg.embed(embedMsg);
						} else {
							if(coins >= cost) {
								tools.push(quantity);
								await Utils.queryDB("UPDATE users SET tools='"+JSON.stringify(tools)+"' WHERE discordID=" + msg.author.id);
								Utils.log("\x1b[36m%s\x1b[0m", "DB: Successfully bought tool!");
								embedMsg.addField("Bought Item", "You successfully bought a **"+name+"** for **"+cost+"** coins!");
								var achVar = "woodworkerOwned";
								if(quantity == 1) achVar = "gemcrusherOwned";
								else if(quantity == 2) achVar = "woodworkerOwned";
								else if(quantity == 3) achVar = "recyclerOwned";
								else if(quantity == 4) achVar = "sharpenerOwned";
								await Utils.queryDB("UPDATE achievement_progress SET "+achVar+"=1 WHERE id="+userID);
								await Utils.takeCoins(msg.author.id, cost);
								return msg.embed(embedMsg);
							} else {
							Utils.log("\x1b[36m%s\x1b[0m", "DB: Needs " + cost + " coins, has " + coins);
							embedMsg.addField("Can't Buy", "You don't have the **" + cost + "** coins needed!");
							return msg.embed(embedMsg);
							}
						}
					} else {
						if(amount > 0) {
							quantity = (marketRes[selectedBuy].quantity)*amount;
							cost = (marketRes[selectedBuy].cost)*amount;
						}
						if (coins >= cost) {
							await Utils.queryDB("UPDATE users SET "+userVar+"="+userVar+"+"+quantity+" WHERE discordID=" + msg.author.id);
							Utils.log("\x1b[36m%s\x1b[0m", "DB: Successfully bought item!");
							embedMsg.addField("Bought Item", "You successfully bought "+amount+" lot(s) of **"+name+"** for **"+cost+"** coins!");
							await Utils.queryDB("UPDATE achievement_progress SET marketBought=marketBought+"+amount+" WHERE id="+userID);
							await Utils.takeCoins(msg.author.id, cost);
							return msg.embed(embedMsg);
						} else {
							Utils.log("\x1b[36m%s\x1b[0m", "DB: Needs " + cost + " coins, has " + coins);
							embedMsg.addField("Can't Buy", "You don't have the **" + cost + "** coins needed!");
							return msg.embed(embedMsg);
						}
					}
                } else {
                    embedMsg.addField("Can't Buy", "That's not a valid item to buy! Please check the `hod?market` list!");
                    return msg.embed(embedMsg);
                }
        }
	};
}