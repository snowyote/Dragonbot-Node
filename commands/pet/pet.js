const {Command} = require('discord.js-commando');
const Utils = require('../../core/utils.js');
const Discord = require('discord.js');
const Jimp = require('jimp');

module.exports = class PetCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'pet',
            group: 'pet',
            memberName: 'pet',
            description: 'View your active pet',
            examples: ['pet'],
        });
    }

    async run(msg) {
        const embedMsg = new Discord.RichEmbed()
                  .setAuthor("House of Dragons Notice", "https://i.imgur.com/CyAb3mV.png")

        let queryRes = await Utils.queryDB("SELECT * FROM users WHERE discordID=" + msg.author.id);
        console.log("DB: Selected user ID " + msg.author.id);
        var active = queryRes[0].activePet;
        var equipmentList = JSON.parse(queryRes[0].equipmentList);
        var userAch = JSON.parse(queryRes[0].achievements);
        var toolList = JSON.parse(queryRes[0].tools);
        var a = queryRes[0].achievements;
		
        if (active > 0) {
            const petRes = await Utils.queryDB("SELECT * FROM pets WHERE id=" + active);
            console.log("DB: Selected pet ID " + active);
            if (petRes[0].isEgg == 0) {
                // Necessary variables
                var bgType = petRes[0].bgType;
                var activePet = active;
                var petType = petRes[0].petType;
                var dyeType = petRes[0].dyeType;
                var name = petRes[0].name;
                var level = petRes[0].level;
                var exp = petRes[0].exp;
                var skillPoints = petRes[0].skillPoints;
                var luck = petRes[0].luck;
                var avarice = petRes[0].avarice;
                var stamina = petRes[0].stamina;
                var hunting = petRes[0].hunting;
                var mining = petRes[0].mining;
                var dexterity = JSON.parse(petRes[0].dexterity);
                var strength = JSON.parse(petRes[0].strength);
                var survival = JSON.parse(petRes[0].survival);
                var maxStamina = petRes[0].maxStamina;
                var intelligence = petRes[0].intelligence;
                var equippedList = JSON.parse(petRes[0].equippedList);
                var luckBoost = petRes[0].luckBoost;
                var avariceBoost = petRes[0].avariceBoost;
                var intelBoost = petRes[0].intelBoost;

                // JIMP processing stuff
                let imgRaw = './img/new/newBG/' + bgType + '.png';
                let snowflake = new Date().getTime();
                let imgBG = './img/temp/active_' + snowflake + '.png';
                let imgExported = './img/temp/' + snowflake + '.png';
                let imgPet = './img/new/newPets/' + petType + '.png';

                // GUI stuff
                let guiBar = './img/new/newGUI/guibar.png';
                let skillBar = './img/new/newGUI/skillbar.png';
                let avatarURL = msg.author.displayAvatarURL;

                // Level up / check level is correct								
                var rs = new Utils.RSExp();
                var newxp = exp;
                var newlvl = level;

                while (newxp >= rs.level_to_xp(newlvl + 1)) {
                    newxp -= rs.level_to_xp(level + 1);
                    newlvl += 1;
                }

                var statPointsGained = newlvl - level;

                const updateRes = await Utils.queryDB("UPDATE pets SET exp=" + newxp + ", level=" + newlvl + ", skillPoints=skillPoints+" + statPointsGained + " WHERE id=" + activePet);
                console.log("DB: Updated level/xp of pet ID " + activePet + " successfully!");
                level = newlvl;
                skillPoints += statPointsGained;
                exp = newxp;

                // Give challenge rewards (level 50)
                if (level >= 50) {
                    var rewardNum = 13;
                    if (equipmentList.includes(rewardNum) == false) {
                        equipmentList.push(rewardNum);
                        const embedMsg = new Discord.RichEmbed()
                                  .setAuthor("Challenge Reward", "https://i.imgur.com/CyAb3mV.png")
                                  .setColor("#FDF018")
                                  .addField("Level 50", "Congratulations on hitting **Level 50**, you've been given the **Graduation Cap** as a reward!");
                        await msg.embed(embedMsg);
                    }
                }

                // Get pet head coordinates
                queryRes = await Utils.queryDB("SELECT * FROM pet_types WHERE id=" + petType);

                let headX = queryRes[0].headX;
                let headY = queryRes[0].headY;
                console.log("DB: Selected pet_type " + petType + " with coordinates " + headX + "," + headY);

                // Get equipment
                let equipRes = await Utils.queryDB("SELECT * FROM items");
                let toolRes = await Utils.queryDB("SELECT * FROM tools");
				var hasCrusher = 0, hasWoodworker = 0, hasRecycler = 0, hasSharpener = 0;
				if(toolList.includes(1)) hasCrusher = 1;
				if(toolList.includes(2)) hasWoodworker = 1;
				if(toolList.includes(3)) hasRecycler = 1;
				if(toolList.includes(4)) hasSharpener = 1;
                var itemImgList = new Array();
                var hgImgList = new Array();
                console.log("DB: Executing equippedList loop: " + equippedList.length);
                if (equippedList.length > 0) {
                    for (var i = 0; i < equippedList.length; i++) {
                        console.log("DB: Loop " + i + " value: " + equippedList[i] + " (" + equipRes[equippedList[i] - 1].type + ")");
                        if (equipRes[equippedList[i] - 1].type == "Headgear") {
                            hgImgList.push(equippedList[i] + "-" + headX + "-" + headY);
                            console.log("DB: Added headgear " + equippedList[i] + " at " + headX + "," + headY);
                        } else if (equipRes[equippedList[i] - 1].type == "Power") {
                            var txx = 587;
                            var tyy = 285;
                            itemImgList.push(equippedList[i] + "-" + txx + "-" + tyy);
                            console.log("DB: Added power " + equippedList[i] + " at " + txx + "," + tyy);
                        } else if (equipRes[equippedList[i] - 1].type == "Trinket") {
                            var txx = 616;
                            var tyy = 315;
                            console.log("DB: Added trinket " + equippedList[i] + " at " + txx + "," + tyy);
                            itemImgList.push(equippedList[i] + "-" + txx + "-" + tyy);
						} else {
                            var txx = 98;
                            var tyy = 184;
                            itemImgList.push(equippedList[i] + "-" + txx + "-" + tyy);
                            console.log("DB: Added misc " + equippedList[i] + " at " + txx + "," + tyy);
                        }
                    }
                }

                // Get achievements
                queryRes = await Utils.queryDB("SELECT * FROM achievements");

                console.log("DB: Executing userAch loop: " + userAch.length+"\nDB: userAch contains: "+userAch);
                var trophies = new Array();
                if (userAch.length > 0) {
                    for (var i = 0; i < userAch.length; i++) {
                        var type = queryRes[userAch[i]-1].type;
                        if (type == "Trophy") {
							console.log("DB: Pushing trophy "+queryRes[userAch[i]-1].id+", name: "+queryRes[userAch[i]-1].name);
                            trophies.push(queryRes[userAch[i]-1].id);
                        }
                    }
                }
                console.log("DB: Found " + trophies.length + " trophies for discord ID " + msg.author.id);

                // Get total achievement percentage
                var achPercent = Math.round((userAch.length / queryRes.length) * 100);

                // Text placements
                let staminaText = {
                    text: stamina + '/' + maxStamina,
                    maxWidth: 200,
                    placementX: 47,
                    placementY: 11
                };
                let luckText = {
                    text: luck + luckBoost,
                    maxWidth: 200,
                    placementX: 43,
                    placementY: 48
                };
                let avariceText = {
                    text: avarice + avariceBoost,
                    maxWidth: 200,
                    placementX: 43,
                    placementY: 85
                };
                let huntingText = {
                    text: hunting,
                    maxWidth: 200,
                    placementX: 43,
                    placementY: 159
                };
                let miningText = {
                    text: mining,
                    maxWidth: 200,
                    placementX: 43,
                    placementY: 196
                };
                let intelText = {
                    text: intelligence + intelBoost,
                    maxWidth: 200,
                    placementX: 43,
                    placementY: 122
                };
                let skillText = {
                    text: skillPoints,
                    maxWidth: 200,
                    placementX: 43,
                    placementY: 233
                };
                let achText = {
                    text: achPercent + '%',
                    maxWidth: 200,
                    placementX: 620,
                    placementY: 11
                };
                let nameText = {
                    text: name,
                    maxWidth: 500,
                    placementX: 255,
                    placementY: 349
                };
                let levelText = {
                    text: "Affection " + level,
                    maxWidth: 500,
                    placementX: 255,
                    placementY: 317
                };
				
				let str = strength[0];
				let dex = dexterity[0];
				let srv = survival[0];
				
                let strengthText = {
                    text: str + '',
                    maxWidth: 20,
                    placementX: 111,
                    placementY: 325
                };
                let survivalText = {
                    text: srv + '',
                    maxWidth: 20,
                    placementX: 152,
                    placementY: 325
                };
                let dexterityText = {
                    text: dex + '',
                    maxWidth: 20,
                    placementX: 192.5,
                    placementY: 325
                };

                // Update user's equipment list
                queryRes = await Utils.queryDB("UPDATE users SET equipmentList='" + JSON.stringify(equipmentList) + "' WHERE discordID=" + msg.author.id);
                console.log("DB: Updated equipment list for discord ID " + msg.author.id + "!");
                
                // Compile everything together
                let tpl = await Jimp.read(imgRaw);
                let clone = await tpl.clone().writeAsync(imgBG);

                // Read cloned (active) image
                tpl = await Jimp.read(imgBG);
				
				//add gem crusher
				if(hasCrusher == 1) {
					const crusherTpl = await Jimp.read('./img/new/newTools/1.png');
					tpl.composite(crusherTpl, 472, 176);
				}
				
				//add gem crusher
				if(hasWoodworker == 1) {
					const crusherTpl = await Jimp.read('./img/new/newTools/2.png');
					tpl.composite(crusherTpl, 548, 209);
				}
				
				//add gem crusher
				if(hasRecycler == 1) {
					const crusherTpl = await Jimp.read('./img/new/newTools/3.png');
					tpl.composite(crusherTpl, 629, 233);
				}
				
				//add sharpener
				if(hasSharpener == 1) {
					const sharpenerTpl = await Jimp.read('./img/new/newTools/4.png');
					tpl.composite(sharpenerTpl, 576, 257);
				}

                // Combine pet into image
                const petTpl = await Jimp.read(imgPet);
				var centerX = tpl.bitmap.width * 0.5;
				var centerY = tpl.bitmap.height * 0.5;
				tpl.composite(petTpl, centerX-(petTpl.bitmap.width * 0.5)-15, centerY-(petTpl.bitmap.height * 0.5)-15, [Jimp.BLEND_DESTINATION_OVER, 1, 1]);
				
				// Create per mask
				const petMask = await petTpl.clone();
				const petMask2 = await petTpl.clone();

				petMask2.color([
				  { apply: 'lighten', params: [50] }
				]);
				petMask.background(0x00000000);
				petMask.opaque();
				petMask.brightness(-1);
				petMask.composite(petMask2,0,0);

				if(dyeType > 0) {
					console.log("DB: Has dye!");
					const dyeTpl = await Jimp.read("./img/dyes/"+parseInt(dyeType)+".jpg");
						await petTpl.composite(dyeTpl,0,0, {
							mode: Jimp.BLEND_OVERLAY,
							opacitySource: 1,
							opacityDest: 1
						});
						await petTpl.mask(petMask,0,0);
						tpl.composite(petTpl, centerX-(petTpl.bitmap.width * 0.5)-15, centerY-(petTpl.bitmap.height * 0.5)-15, [Jimp.BLEND_DESTINATION_OVER, 1, 1]);
				} else console.log("DB: Doesn't have dye!");

                const guiTpl = await Jimp.read(guiBar);
                tpl.composite(guiTpl, 0, 296, [Jimp.BLEND_DESTINATION_OVER, 1, 1]);

                //add equipment
                for (var index = 0; index < itemImgList.length; index++) {
                    let itemArray = itemImgList[index].split('-');
                    const itemTpl = await Jimp.read('./img/new/newItems/' + parseInt(itemArray[0]) + '.png');
                    tpl.composite(itemTpl, parseInt(itemArray[1]), parseInt(itemArray[2]), [Jimp.BLEND_DESTINATION_OVER, 1, 1]);
                }

                //add headgear
                for (var index = 0; index < hgImgList.length; index++) {
                    let hgArray = hgImgList[index].split('-');
                    const hgTpl = await Jimp.read('./img/new/newItems/' + parseInt(hgArray[0]) + '.png');
                    tpl.composite(hgTpl, (centerX-(petTpl.bitmap.width * 0.5)-15)+parseInt(hgArray[1]), (centerY-(petTpl.bitmap.height * 0.5)-15)+parseInt(hgArray[2]), [Jimp.BLEND_DESTINATION_OVER, 1, 1]);
                }
                
                const skillTpl = await Jimp.read(skillBar);
                tpl.composite(skillTpl, 6, 5, [Jimp.BLEND_DESTINATION_OVER, 1, 1]);

                const avatarTpl = await Jimp.read(avatarURL);
				await avatarTpl.resize(82,86);
                tpl.composite(avatarTpl, 4, 312, [Jimp.BLEND_DESTINATION_OVER, 1, 1]);

                //add trophy badges
                for (var index = 0; index < trophies.length; index++) {
					console.log("DB: Adding trophy images - "+trophies);
                    const trophyTpl = await Jimp.read('./img/new/newTrophies/' + parseInt(trophies[index]) + '.png');
                    tpl.composite(trophyTpl, 0, 0, [Jimp.BLEND_DESTINATION_OVER, 1, 1]);
                }

                //write text

                let font = await Jimp.loadFont('./fonts/beleren15.fnt');
                tpl.print(font, staminaText.placementX, staminaText.placementY, staminaText.text, staminaText.maxWidth, staminaText.maxHeight);
                tpl.print(font, luckText.placementX, luckText.placementY, luckText.text, luckText.maxWidth, luckText.maxHeight);
                tpl.print(font, avariceText.placementX, avariceText.placementY, avariceText.text, avariceText.maxWidth, avariceText.maxHeight);
                tpl.print(font, miningText.placementX, miningText.placementY, miningText.text, miningText.maxWidth, miningText.maxHeight);
                tpl.print(font, huntingText.placementX, huntingText.placementY, huntingText.text, huntingText.maxWidth, huntingText.maxHeight);
                tpl.print(font, skillText.placementX, skillText.placementY, skillText.text, skillText.maxWidth, skillText.maxHeight);
                tpl.print(font, intelText.placementX, intelText.placementY, intelText.text, intelText.maxWidth, intelText.maxHeight);
                tpl.print(font, achText.placementX, achText.placementY, achText.text, achText.maxWidth, achText.maxHeight);
                tpl.print(font, levelText.placementX, levelText.placementY, {
                    text: levelText.text,
                    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
                }, 187, 42);
				
                font = await Jimp.loadFont('./fonts/beleren10.fnt');
                tpl.print(font, strengthText.placementX, strengthText.placementY, {
                    text: strengthText.text,
                    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
                }, 12, 8);
                tpl.print(font, dexterityText.placementX, dexterityText.placementY, {
                    text: dexterityText.text,
                    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
                }, 12, 8);
                tpl.print(font, survivalText.placementX, survivalText.placementY, {
                    text: survivalText.text,
                    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
                }, 12, 8);

                //write name
                font = await Jimp.loadFont('./fonts/beleren22.fnt');
                tpl.print(font, nameText.placementX, nameText.placementY, {
                    text: nameText.text,
                    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
                }, 187, 42);

                // render to buffer
                const buffer = await tpl.filterType(0).getBufferAsync('image/png');
				await msg.say("", {
					files: [buffer]
				});
            } else {
                embedMsg.addField("Not Ready", "This pet hasn't been hatched yet, use `!hatch` to check up on it!");
				msg.embed(embedMsg);
            }
        } else {
            embedMsg.addField("No Pet", "You don't have a pet, get one using `!adopt`!");
			msg.embed(embedMsg);
        }
    };
}