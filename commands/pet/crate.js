const {Command} = require('discord.js-commando');
const Utils = require('../../core/utils.js');
const Discord = require('discord.js');

module.exports = class CrateCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'crate',
            group: 'pet',
            memberName: 'crate',
            description: 'Open a crate',
            examples: ['crate <type> <all>'],
			args: [
				{
					key: 'type',
					prompt: 'Which type of crate do you want to open?',
					type: 'integer',
					default: ''
				},
				{
					key: 'amount',
					prompt: 'Open all crates?',
					type: 'string',
					default: ''
				}
			]
        });
    }

    async run(msg, {type,amount}) {
        const embedMsg = new Discord.RichEmbed()
            .setAuthor("House of Dragons Notice", "https://i.imgur.com/CyAb3mV.png")
            .setFooter("hod?crate <type> <all> - Use 'all' to open all crates at once!")

        let queryRes = await Utils.queryDB("SELECT * FROM users WHERE discordID=" + msg.author.id);
        console.log("DB: Selected user ID " + msg.author.id);
        var userID = queryRes[0].id;
        var crateKeys = queryRes[0].crateKeys;
        var crate = JSON.parse(queryRes[0].crate);
        var active = queryRes[0].activePet;
        var rs = new Utils.RSExp();
		let crateRes = await Utils.queryDB("SELECT * FROM crate_types");
		let petRes = await Utils.queryDB("SELECT * FROM pets WHERE id=" + active);
		var petName = petRes[0].name;
		
		if(!type) {
			for(var i = 0; i < crateRes.length; i++) {
				embedMsg.addField("["+(i+1)+"] "+crateRes[i].name+" ("+crate[crateRes[i].index]+")", crateRes[i].description+"\n**Cost: **"+crateRes[i].keyCost+" keys");
			}
			embedMsg.addField("Choose a crate!", "Use `hod?crate <type> <all>` to open a type of crate!");
            return msg.embed(embedMsg);
		} else {
			type -= 1;
			if(type >= 0 && type < crateRes.length) {
				if(crate[crateRes[type].index] > 0) {
					var cost = crateRes[type].keyCost;
					console.log("DB: Chose crate type "+(crateRes[type].index)+", cost is "+cost);
					if(crateKeys >= cost) {
						var expRange = JSON.parse(crateRes[type].exp);
						var coinRange = JSON.parse(crateRes[type].coins);
						var orbRange = JSON.parse(crateRes[type].orbs);
						var crateRange = JSON.parse(crateRes[type].woodenCrates);
						var keyRange = JSON.parse(crateRes[type].crateKeys);
						var expGained = 0, coinsGained = 0, orbsGained = 0, cratesGained = 0, keysGained = 0, crateNum = 0;
							
						if(amount == "all") {
							while(crate[crateRes[type].index] > 0 && crateKeys >= cost) {
								expGained += Utils.randomIntIn(expRange[0], expRange[1]);
								coinsGained += Utils.randomIntIn(coinRange[0], coinRange[1]);
								orbsGained += Utils.randomIntIn(orbRange[0], orbRange[1]);
								cratesGained += Utils.randomIntIn(crateRange[0], crateRange[1]);
								keysGained += Utils.randomIntIn(keyRange[0], keyRange[1]);
								crateKeys -= cost;
								crate[crateRes[type].index] -= 1;
								crateNum++;
							}
						} else {
							expGained += Utils.randomIntIn(expRange[0], expRange[1]);
							coinsGained += Utils.randomIntIn(coinRange[0], coinRange[1]);
							orbsGained += Utils.randomIntIn(orbRange[0], orbRange[1]);
							cratesGained += Utils.randomIntIn(crateRange[0], crateRange[1]);
							keysGained += Utils.randomIntIn(keyRange[0], keyRange[1]);
							crate[crateRes[type].index] -= 1;
							crateKeys -= cost;
							crateNum ++;
						}
							
						crate[0] += cratesGained;
						crateKeys += keysGained;
							
						await Utils.queryDB("UPDATE users SET crate='"+JSON.stringify(crate)+"', crateKeys="+crateKeys+", coins=coins+"+coinsGained+", mysticOrbs=mysticOrbs+"+orbsGained+" WHERE discordID="+msg.author.id);
						await Utils.queryDB("UPDATE pets SET exp=exp+" + expGained + " WHERE id=" + active);
							
							// Opened a golden crate?
						if(crateRes[type].id == 2) await Utils.queryDB("UPDATE achievement_progress SET coinsGained=coinsGained+" + coinsGained + ", gcratesOpened=gcratesOpened+" + crateNum + ", expGained=expGained+" + expGained + " WHERE id=" + userID);
						else await Utils.queryDB("UPDATE achievement_progress SET coinsGained=coinsGained+" + coinsGained + ", cratesOpened=cratesOpened+" + crateNum + ", expGained=expGained+" + expGained + " WHERE id=" + userID);
							
						embedMsg.addField(crateNum+" "+crateRes[type].name+"(s) Opened", 
							"***Used "+crateNum*cost+" key(s)!***\n"+
							"📚 **+" + expGained + "** Affection EXP\n"+
							"💰 **+" + coinsGained + "** Coins\n"+
							"🔮 **+" + orbsGained + "** Mystic Orbs\n"+
							"📦 **+" + cratesGained + "** Wooden Crates\n"+
							"🔑 **+" + keysGained + "** Keys", true);
							
						var newXP = petRes[0].exp+expGained;
						var newLvl = petRes[0].level;
						var petLvl = petRes[0].level;
						var newSP = 0;

						while (newXP >= rs.level_to_xp(newLvl + 1)) {
							newXP -= rs.level_to_xp(petLvl + 1);
							newLvl += 1;
						}

						var neededXP = rs.level_to_xp(newLvl + 1);
						if (newLvl > petLvl) {
							embedMsg.addField("Affection Up", petName + " levelled up and is now affection level " + (newLvl) + "!");
							newSP = (newLvl - petLvl);
						}

						await Utils.queryDB("UPDATE pets SET exp=" + newXP + ", level=" + newLvl + ", skillPoints=skillPoints+" + newSP + " WHERE id=" + active);
						return msg.embed(embedMsg);
					} else {
						embedMsg.addField("Cannot Open Crate", "You don't have enough keys! Find some with `hod?explore` or `hod?slots`!", true);
						return msg.embed(embedMsg);
					}
				} else {
					embedMsg.addField("Cannot Open Crate", "You don't have any crates of that type!", true);
					return msg.embed(embedMsg);
				}
			} else {
				embedMsg.addField("Cannot Open Crate", "Invalid selection!", true);
				return msg.embed(embedMsg);
			}
		}
    };
}