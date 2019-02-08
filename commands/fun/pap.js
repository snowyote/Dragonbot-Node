const {Command} = require('discord.js-commando');
const Utils = require('../../core/utils.js');
const Discord = require('discord.js');
const Jimp = require('jimp');

module.exports = class PapCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'pap',
            group: 'fun',
            memberName: 'pap',
            description: 'Pap pap pap',
            examples: ['pap @User'],
			args: [
				{
					key: 'pap',
					prompt: 'What user would you like to pap?',
					type: 'user',
					default: () => this.client.user
				}
			]
        });
    }

    async run(msg, {pap}) {
        // JIMP processing stuff
        let imgPap = './img/pap.png';
        let snowflake = new Date().getTime();
        let imgBG = './img/temp/active_' + snowflake + '.png';
        let avatarURL = pap.displayAvatarURL;
		
        // Compile everything together
        let tpl = await Jimp.read(avatarURL);
        let clone = await tpl.clone().writeAsync(imgBG);
        tpl = await Jimp.read(imgBG);
		tpl.resize(544,544);
        const papTpl = await Jimp.read(imgPap);
        tpl.composite(papTpl, 0, 0, [Jimp.BLEND_DESTINATION_OVER, 1, 1]);
		
        // render to buffer
        const buffer = await tpl.filterType(0).getBufferAsync('image/png');
		await msg.say("", {
					files: [buffer]
				});
    };
}