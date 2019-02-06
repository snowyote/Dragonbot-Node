const {Command} = require('discord.js-commando');
const Utils = require('../../core/utils.js');
const Discord = require('discord.js');
const Jimp = require('jimp');

module.exports = class ProfileCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'profile',
            group: 'profile',
            memberName: 'profile',
            description: 'View your profile',
            examples: ['profile'],
        });
    }

    async run(msg) {
        const embedMsg = new Discord.RichEmbed()
                  .setAuthor("House of Dragons Notice", "https://i.imgur.com/CyAb3mV.png")

        let queryRes = await Utils.queryDB("SELECT * FROM users WHERE discordID=" + msg.author.id);
        Utils.log("\x1b[36m%s\x1b[0m", "DB: Selected user ID " + msg.author.id);
        var active = queryRes[0].activePet;
        var equipmentList = JSON.parse(queryRes[0].equipmentList);
        var userAch = JSON.parse(queryRes[0].achievements);
        var toolList = JSON.parse(queryRes[0].tools);
		
        // JIMP processing stuff
        let imgRaw = './img/new/newGUI/profile.png';
        let snowflake = new Date().getTime();
        let imgBG = './img/temp/active_' + snowflake + '.png';
        let imgExported = './img/temp/' + snowflake + '.png';
        let avatarURL = msg.author.displayAvatarURL;
        let name = msg.guild.member(msg.author).nickname;
		let bio = queryRes[0].bio;
		let xp = queryRes[0].xp;
		let lvl = queryRes[0].lvl;
		let reputation = queryRes[0].reputation;
		
		// Level up
		while(xp >= lvl*5) {
			xp -= (lvl*5);
			lvl++;
		}
		
		// Join date stuff
		let joinDate = msg.guild.member(msg.author).joinedAt;
		let y = joinDate.getFullYear();
		let m = joinDate.getMonth();
		let d = joinDate.getDate();
		
        // Get achievements
        queryRes = await Utils.queryDB("SELECT * FROM achievements");

        // Get total achievement percentage
        var achPercent = Math.round((userAch.length / queryRes.length) * 100);
		
		// Role stuff
		let role = "Resident";
		if(msg.member.roles.find("name", "Guests")) role = "Guest";
		if(msg.member.roles.find("name", "Artists")) role = "Artist";
		if(msg.member.roles.find("name", "Staff")) role = "Staff";

                // Text placements
                let joindateText = {
                    text: 'Joined '+d+'/'+m+'/'+y,
                    maxWidth: 300,
                    placementX: 135,
                    placementY: 90
                };
                let nameText = {
                    text: name,
                    maxWidth: 450,
                    placementX: 135,
                    placementY: 58
                };
                let roleText = {
                    text: role,
                    maxWidth: 150,
                    placementX: 135,
                    placementY: 130
                };
                let bioText = {
                    text: bio,
                    maxWidth: 320,
                    placementX: 135,
                    placementY: 180
                };
                let repText = {
                    text: '+'+reputation+' Rep',
                    maxWidth: 150,
                    placementX: 300,
                    placementY: 130
                };
                let lvlText = {
                    text: 'Lvl. '+lvl,
                    maxWidth: 150,
                    placementX: 18,
                    placementY: 180
                };
                let xpText = {
                    text: xp+'/'+(lvl*5),
                    maxWidth: 150,
                    placementX: 18,
                    placementY: 210
                };
				
                // Compile everything together
                let tpl = await Jimp.read(imgRaw);
                let clone = await tpl.clone().writeAsync(imgBG);
                tpl = await Jimp.read(imgBG);
				
                const avatarTpl = await Jimp.read(avatarURL);
				await avatarTpl.resize(100,100);
                tpl.composite(avatarTpl, 18, 57, [Jimp.BLEND_DESTINATION_OVER, 1, 1]);

                // Write text
                let font = await Jimp.loadFont('./fonts/sig.fnt');
                tpl.print(font, nameText.placementX, nameText.placementY, nameText.text, nameText.maxWidth, nameText.maxHeight);
                font = await Jimp.loadFont('./fonts/arial.fnt');
                tpl.print(font, joindateText.placementX, joindateText.placementY, joindateText.text, joindateText.maxWidth, joindateText.maxHeight);
                tpl.print(font, bioText.placementX, bioText.placementY, bioText.text, bioText.maxWidth, bioText.maxHeight);
                tpl.print(font, repText.placementX, repText.placementY, repText.text, repText.maxWidth, repText.maxHeight);
                font = await Jimp.loadFont('./fonts/boomer.fnt');
                tpl.print(font, roleText.placementX, roleText.placementY, roleText.text, roleText.maxWidth, roleText.maxHeight);
                tpl.print(font, lvlText.placementX, lvlText.placementY, lvlText.text, lvlText.maxWidth, lvlText.maxHeight);
                font = await Jimp.loadFont('./fonts/boomers.fnt');
                tpl.print(font, xpText.placementX, xpText.placementY, xpText.text, xpText.maxWidth, xpText.maxHeight);

                // render to buffer
                const buffer = await tpl.filterType(0).getBufferAsync('image/png');
				await msg.say("", {
					files: [buffer]
				});
				
				await Utils.queryDB("UPDATE users SET xp="+xp+", lvl="+lvl+" WHERE discordID="+msg.author.id);
    };
}