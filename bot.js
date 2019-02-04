// --------------------------------
// Important requires and constants
// --------------------------------

const { CommandoClient } = require('discord.js-commando');
const path = require('path');
const Discord = require('discord.js');
const Utils = require("./core/Utils.js");
const config = require("./config.json");

// --------------------------------
// Register the client and commands
// --------------------------------

const client = new CommandoClient({
    commandPrefix: '!',
    unknownCommandResponse: true,
    owner: '194534206217388032',
    disableEveryone: true
});

client.registry
    .registerDefaultTypes()
    .registerGroups([
        ['economy', 'Economy Commands'],
        ['profile', 'Profile Commands'],
        ['server', 'Server Commands'],
        ['pet', 'Pet Commands']
    ])
    .registerDefaultGroups()
    .registerDefaultCommands()
    .registerCommandsIn(path.join(__dirname, 'commands'));

// -------------------------------
// Set up the new day announcement
// -------------------------------

function newDay() {
	var serverStartTime = new Date("2018-06-15").getTime();
	var midnight = new Date();
	midnight.setHours( 24 );
	midnight.setMinutes( 0 );
	midnight.setSeconds( 0 );
	midnight.setMilliseconds( 0 );
	var timeUntilMidnight =  ( midnight.getTime() - new Date().getTime() );
	console.log("New Day Check: "+timeUntilMidnight+"ms until midnight!");
	setTimeout(() => {
			const newDayMsg = new Discord.RichEmbed()
				.setAuthor("House of Dragons", "https://i.imgur.com/CyAb3mV.png")
				.setThumbnail("https://i.imgur.com/CfosMZR.png")
				.addField("New Day Alert", 
					"It's midnight in GMT and so begins a new day!\n\n"+
					"It has been **"+Utils.formatTimeSince(serverStartTime, true)+"** since the House of Dragons began!\n\n"+
					"The purge is commencing! Any guests who have not accepted the rules will now be kicked!\n\n"+
					"As of now, there are **"+client.users.size+"** members of the House of Dragons, including bots!")
			client.channels.get('541042784396640257').send(newDayMsg);
			// do kicking stuff here, not implemented
			newDay();
		},timeUntilMidnight); // Check this every second
}

// -------------------------------
// Let's a-go!
// -------------------------------
	
client.on('ready', () => {
	console.log("Bot has started, with "+client.users.size+" users!"); 
	client.user.setActivity("with dragon butts");
	newDay();
});

client.login(config.token);