const { CommandoClient } = require('discord.js-commando');
const path = require('path');
const config = require("./config.json");

const client = new CommandoClient({
    commandPrefix: 'hod?',
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

client.on('ready', () => {
    console.log('Logged in!');
    client.user.setActivity('game');
});

client.login(config.token);