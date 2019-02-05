const {
    Command
} = require('discord.js-commando');
const Utils = require('../../core/utils.js');
const Discord = require('discord.js');
const Jimp = require('jimp');

module.exports = class DyeCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'dye',
            group: 'pet',
            memberName: 'dye',
            description: 'Dye your active pet',
            examples: ['dye'],
            args: [
			{
                key: 'id',
                prompt: 'What dye do you want?',
                type: 'integer',
				min: 1,
				default: ''
			},
			{
				key: 'verify',
				prompt: 'Verify?',
				type: 'string',
				default: ''
			}]
        });
    }

    async run(msg, {id,verify}) {
		const embedMsg = new Discord.RichEmbed()
            .setAuthor("House of Dragons Notice", "https://i.imgur.com/CyAb3mV.png")

        let queryRes = await Utils.queryDB("SELECT * FROM users WHERE discordID=" + msg.author.id);
		var coins = queryRes[0].coins;
        Utils.log("\x1b[36m%s\x1b[0m", "DB: Selected user ID " + msg.author.id);
		var userID = queryRes[0].id;
        var active = queryRes[0].activePet;
        if (active > 0) {
            const petRes = await Utils.queryDB("SELECT * FROM pets WHERE id=" + active);
            Utils.log("\x1b[36m%s\x1b[0m", "DB: Selected pet ID " + active);
            if (petRes[0].isEgg == 0) {
				const dyeRes = await Utils.queryDB("SELECT * FROM dyes");
				if(!id) {
					var str = "";
					for(var i = 0; i < dyeRes.length; i++) {
						str = str + "[**"+(i+1)+"**] "+dyeRes[i].icon+" "+dyeRes[i].name+" - ("+dyeRes[i].cost+" coins)\n";
					}
					str = str.slice(0, -1);
					embedMsg.addField("List of Dyes", str);
					embedMsg.setFooter("!dye <number> - to see what it'd look like!");
					return msg.embed(embedMsg);
				} else {
						var selectedDye = id;
						if(selectedDye >= 1 && selectedDye <= dyeRes.length) {
							selectedDye -= 1;
							////TEST
							if(!verify && selectedDye > 0) {
								let tpl = await Jimp.read("./img/new/newPets/"+petRes[0].petType+".png");
								let clone = await tpl.clone();
								tpl = clone;
								const petTpl = await Jimp.read("./img/new/newPets/"+petRes[0].petType+".png");
								tpl.composite(petTpl, 0, 0, [Jimp.BLEND_DESTINATION_OVER, 1, 1]);
								const petMask = await petTpl.clone();
								const petMask2 = await petTpl.clone();

								petMask2.color([
								  { apply: 'lighten', params: [50] }
								]);
								petMask.background(0x00000000);
								petMask.opaque();
								petMask.brightness(-1);
								petMask.composite(petMask2,0,0);
								const dyeTpl = await Jimp.read("./img/dyes/"+selectedDye+".jpg");
										await petTpl.composite(dyeTpl,0,0, {
											mode: Jimp.BLEND_OVERLAY,
											opacitySource: 1,
											opacityDest: 1
										});
										await petTpl.mask(petMask,0,0);
										tpl.composite(petTpl, 0, 0, [Jimp.BLEND_DESTINATION_OVER, 1, 1]);
								const buffer = await tpl.filterType(0).getBufferAsync('image/png');
								
								await msg.say("", {
								files: [buffer]
								});
								embedMsg.addField("Like this dye?", "Use `!dye "+(selectedDye+1)+" verify` to buy this!");
								return msg.embed(embedMsg);
							} else if (verify=="verify" || selectedDye == 0) {
							////TEST
								if(coins >= dyeRes[selectedDye].cost) {
									await Utils.queryDB("UPDATE pets SET dyeType="+selectedDye+" WHERE id="+active);
									await Utils.queryDB("UPDATE users SET coins=coins-"+dyeRes[selectedDye].cost+" WHERE discordID="+msg.author.id);
									Utils.log("\x1b[36m%s\x1b[0m", "DB: Successfully dyed pet!");
									embedMsg.addField("Pet Dyed", "You successfully dyed your pet **"+dyeRes[selectedDye].name+"**!");
									await Utils.queryDB("UPDATE achievement_progress SET petDyed=petDyed+1 WHERE id="+userID);
									return msg.embed(embedMsg);
								} else {
									Utils.log("\x1b[36m%s\x1b[0m", "DB: Needs "+dyeRes[selectedDye].cost+" coins, has "+coins);
									embedMsg.addField("Can't Dye", "You don't have the **"+dyeRes[selectedDye].cost+"** coins needed!");
									return msg.embed(embedMsg);
								}
							} else {
								embedMsg.addField("Can't Dye", "Please use `!dye <number> verify` to dye your pet!");
								return msg.embed(embedMsg);
							}
						} else {
							embedMsg.addField("Can't Dye", "That's not a valid dye! Please check the `!dye` list!");
							return msg.embed(embedMsg);
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
	};
}