const { Command } = require('discord.js-commando');
const Utils = require('../../core/utils.js');
const Discord = require('discord.js');
const { SlotMachine, SlotSymbol } = require('slot-machine');

module.exports = class SlotsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'slots',
            group: 'economy',
            memberName: 'rpg',
            description: 'Play slots to win coins or pet items!',
            examples: ['bet amount'],
			args: [
			{
				key: 'amount',
				prompt: 'How many coins do you want to bet?',
				type: 'integer',
				validate: amount => {
					if(amount > 0) return true;
					return 'Amount of coins is below 1!';
				}
			}]
        });
    }
	
	    async run(msg, {amount}) {
			const embedMsg = new Discord.RichEmbed()
				.setAuthor("House of Dragons Casino", "https://i.imgur.com/CyAb3mV.png")
				.setColor("#FDF018")
				.setDescription("<@"+msg.author.id+">")
			if(await Utils.canUseAction(msg.author, 'slots')) {
				embedMsg.setFooter("📝 Please wait 10 seconds before using this again..")
				let userRes = await Utils.queryDB("SELECT * FROM users WHERE discordID=" + msg.author.id);
				let serverRes = await Utils.queryDB("SELECT * FROM server");
				
				var jackpotAmt = serverRes[0].jackpotAmount;
				var coins = userRes[0].coins;
				var userID = userRes[0].id;
				var crate = JSON.parse(userRes[0].crate);
				if(amount <= coins){
					var jackpotChance = 0.0005*amount;
					if(jackpotChance > 15) jackpotChance = 15;
					
					var keyChance = 0.01*amount;
					if(keyChance > 30) keyChance = 30;
						
					var crateChance = 0.01*amount;
					if(crateChance > 20) crateChance = 20;
						
					const cherry = new SlotSymbol('cherry', {
						display: '🍒',
						points: amount*2,
						weight: 100
					});
						
					const cross = new SlotSymbol('cross', {
						display: '❌',
						points: 0,
						weight: 80
					});
						
					const three = new SlotSymbol('three', {
						display: '🍋',
						points: amount*4,
						weight: 70
					});

					const two = new SlotSymbol('two', {
						display: '🍏',
						points: amount*6,
						weight: 50
					});

					const one = new SlotSymbol('one', {
						display: '🍇',
						points: amount*8,
						weight: 30
					});

					const trophy = new SlotSymbol('trophy', {
						display: '🍪',
						points: amount*12,
						weight: 20
					});

					const jackpot = new SlotSymbol('jackpot', {
						display: '🐲',
						points: amount*16,
						weight: jackpotChance
					});

					const keys = new SlotSymbol('keys', {
						display: '🔑',
						points: 0,
						weight: keyChance,
						wildcard: true
					});

					const crates = new SlotSymbol('crates', {
						display: '📦',
						points: 0,
						weight: crateChance,
						wildcard: true
					});

					const machine = new SlotMachine(3, [cherry, cross, three, two, one, trophy, keys, crates, jackpot]);
					const results = machine.play();
					var winNum = results.winCount;
					var totalPoints = 0;
					
					if(results.lines[0].isWon) totalPoints += Math.floor(results.lines[0].points/3);
					if(results.lines[1].isWon) totalPoints += Math.floor(results.lines[1].points/3);
					if(results.lines[2].isWon) totalPoints += Math.floor(results.lines[2].points/3);
					if(results.lines[3].isWon) winNum -= 1;
					if(results.lines[4].isWon) winNum -= 1;
					
					var resultArray = results.lines.slice(0, -2);
						
					var coinsGained = 0;
					var totalCoins = 0;
						
					if(winNum > 0) { 
						coinsGained += totalPoints;
						totalCoins = (parseInt(coins) + coinsGained);
					}
					else {
						coinsGained = 0 - amount;
						totalCoins = (parseInt(coins) - amount);
					}
						
					for(var i = 0; i < resultArray.length; i++) {
						if(results.lines[i].symbols[0].name == "jackpot" && results.lines[i].symbols[1].name == "jackpot" && results.lines[i].symbols[2].name == "jackpot") {
							totalPoints += jackpotAmt;
							await connection.query("UPDATE achievement_progress SET wonJackpots=wonJackpots+1 WHERE id="+userID);
							await connection.query("UPDATE server SET jackpotAmount=0 WHERE id=1");
						}
					}		
						
					var keyNum = 0;
						
					for(var i = 0; i < resultArray.length; i++) {
						for(var a = 0; a < resultArray.length; a++) {
							if(results.lines[i].symbols[a].name == "keys") {
								keyNum++;
							}
						}
					}		
						
					var crateNum = 0;
						
					for(var i = 0; i < resultArray.length; i++) {
						for(var a = 0; a < resultArray.length; a++) {
							if(results.lines[i].symbols[a].name == "crates") {
								crateNum++;
								crate[0]++;
							}
						}
					}		
						
					embedMsg.addField("🎰 Slots 🎰", results.visualize(),true);
						
					var keyMsg = "";
					var crateMsg = "";
						
					if(keyNum > 0) {
						keyMsg = "You found **"+keyNum+"** key(s)!\n";
					}
						
					if(crateNum > 0) {
						crateMsg = "You found **"+crateNum+"** Wooden Crate(s)!\n";
					}
						
					if(winNum < 1 || totalPoints < 1) {
						embedMsg.addField("Try again!", "No wins this time!\n"+keyMsg+crateMsg+"🐲 Jackpot: ***"+jackpotAmt+"***\n"+"💰 Coins: ***"+totalCoins+"***",true);
						await Utils.queryDB("UPDATE users SET crate='"+JSON.stringify(crate)+"', crateKeys=crateKeys+"+keyNum+", coins=coins-"+parseInt(amount)+" WHERE discordID="+msg.author.id);
						await Utils.queryDB("UPDATE achievement_progress SET slotCount=slotCount+1, casinoProfit=casinoProfit-"+parseInt(amount)+" WHERE id="+userID);					
						} else if(winNum > 0) {
							embedMsg.addField("You won!", "Gained "+totalPoints+" coins!\n"+keyMsg+crateMsg+"🐲 Jackpot: ***"+jackpotAmt+"***\n"+"💰 Coins: ***"+totalCoins+"***",true);
							await Utils.queryDB("UPDATE users SET crate='"+JSON.stringify(crate)+"', crateKeys=crateKeys+"+keyNum+", coins=coins+"+totalPoints+" WHERE discordID="+msg.author.id);
							await Utils.queryDB("UPDATE achievement_progress SET slotCount=slotCount+1, coinsGained=coinsGained+"+totalPoints+", casinoProfit=casinoProfit+"+totalPoints+" WHERE id="+userID);
						}
						
						await Utils.queryDB("UPDATE server SET jackpotAmount=jackpotAmount+"+amount+" WHERE id=1");
						
						embedMsg.addBlankField(true);
						embedMsg.addField("Chances [1]", "🍒 "+(machine.chanceOf('cherry')*100).toFixed(2)+"% - Bet x2\n"+
												 "❌ "+(machine.chanceOf('cross')*100).toFixed(2)+"% - Nothing\n"+
												 "🍋 "+(machine.chanceOf('three')*100).toFixed(2)+"% - Bet x4\n",true);
						embedMsg.addField("Chances [2]", "🍏 "+(machine.chanceOf('two')*100).toFixed(2)+"% - Bet x6\n"+
												 "🍇 "+(machine.chanceOf('one')*100).toFixed(2)+"% - Bet x8\n"+
												 "🍪 "+(machine.chanceOf('trophy')*100).toFixed(2)+"% - Bet x12\n",true);
						embedMsg.addField("Chances [3]", "🐲 "+(machine.chanceOf('jackpot')*100).toFixed(2)+"% - Jackpot\n"+
														 "🔑 "+(machine.chanceOf('keys')*100).toFixed(2)+"% - Key (Wild)\n"+
														 "📦 "+(machine.chanceOf('crates')*100).toFixed(2)+"% - Crate (Wild)",true);
						return msg.embed(embedMsg);
					}
					else {
						embedMsg.addField("Not Enough Money", "You don't have the required number of coins to make that bet!");
						return msg.embed(embedMsg);
					}
			} else {
				embedMsg.addField("Can't Play Slots", "You need to be in a casino to use this, find one on the `!map`!");
				return msg.embed(embedMsg);
			}
		};
}