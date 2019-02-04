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
		},timeUntilMidnight);
}

// ----------------------------
// Set up the timed pet updates
// ----------------------------

async function petUpdates() {
		await Utils.delay(10000);
        let petSQL = await Utils.queryDB("SELECT * FROM pets");

        if (petSQL.length > 0) {
            var currentTime = new Date().getTime();
            for (var i = 0; i < petSQL.length; i++) {
                if (petSQL[i].isSleeping == 1) {
                    var sleepTime = petSQL[i].sleepTime;
                    if (currentTime > sleepTime) {
                        await Utils.queryDB("UPDATE pets SET isSleeping = 0 WHERE id=" + petSQL[i].id);
                        console.log("DB: Waking up pet");
                        client.users.get(petSQL[i].ownerName).send("Your active pet **"+petSQL[i].name+"** has woken up!");
                    }
                }
                if (petSQL[i].isEgg == 1) {
                    var hatchTime = petSQL[i].hatchTime;
                    if (currentTime > hatchTime) {
                        console.log("DB: Updated pet ID " + petSQL[i].id + " to egg status 0!");
                        let petType = await Utils.queryDB("SELECT id, name, rarity FROM pet_types");
                        var pets = new Array();
                        var petsWeight = new Array();
                        for (var pi = 0; pi < petType.length; pi++) {
                            pets.push(petType[pi].id);
                            petsWeight.push(petType[pi].rarity);
                        }
                        var totalweight = eval(petsWeight.join("+"));
                        var weighedpets = new Array();
                        var currPet = 0;
                        while (currPet < pets.length) {
                            for (var pw = 0; pw < petsWeight[currPet]; pw++)
                                weighedpets[weighedpets.length] = pets[currPet];
                            currPet++;
                        }

                        var randomnumber = Math.floor(Math.random() * totalweight);
                        var rarity = Utils.petTypeString(petType[pi].rarity);
						
                        var randomPetID = weighedpets[randomnumber];
                        var petName = petType[randomPetID - 1].name;

                        let bgType = await Utils.queryDB("SELECT id, name FROM backgrounds");
                        var randomBG = Math.floor(Math.random() * bgType.length);
                        var bgName = bgType[randomBG].name;
                        var bgID = bgType[randomBG].id;

                        await Utils.queryDB("UPDATE pets SET petType=" + randomPetID + ", bgType=" + bgID + " WHERE id=" + petSQL[i].id);
                        await Utils.queryDB("UPDATE pets SET isEgg=0 WHERE id=" + petSQL[i].id);
                        console.log("DB: Hatching pet!");
                        client.users.get(petSQL[i].ownerName).send("Your pet has hatched into a **"+petName+"** (**"+rarity+"**)!");
                    }
                }
            }
        }
		await petUpdates();
}

// -------------------------------
// Let's a-go!
// -------------------------------
	
client.on('ready', () => {
	console.log("Bot has started, with "+client.users.size+" users!"); 
	client.user.setActivity("with dragon butts");
	newDay();
	petUpdates();
});

client.login(config.token);