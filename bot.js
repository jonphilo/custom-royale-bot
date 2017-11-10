const Discord = require('discord.js');
const client = new Discord.Client();
const request = require('request');

client.on('ready', () => 
{
    console.log('Player Unknowns Custom Royale Bot Starting');
});

client.on('message', message => {
    console.log(message.content);
    if(message.content.substring(0,1) == '.')
    {
        var args = message.content.substring(1).split('-');
        TrimArgumentSpaces(args);
        var cmd = args[0];

        args = args.splice(1);

        switch(cmd){
            case 'getall':
                GetAllCommand(message, args);
                break
            case 'randomgame':
            case 'rando':
                RandomGameCommand(message, args);
                break;
            case 'registergame':
                RegisterGameCommand(message, args);
                message.reply('Game Registered');
                break;
            case 'clr':
            case 'clear':
                ClearMessagesCommand(message);
                break;
            default:
                break;
        }
    }
});

function deleteMessages(message)
{
    message.channel.fetchMessages()
        .then(messages => message.channel.bulkDelete(messages));
}

function TrimArgumentSpaces(args)
{
    for(var i = 0; i < args.length; i++)
    {
        args[i] = args[i].trim();
    }
}

function ClearMessagesCommand(message)
{
    deleteMessages(message);
}

function GetAllCommand(message, args)
{
    if(!IsAdminRole(message))
    {
        return;
    }
    // Set the headers
    var headers = {
        'User-Agent':       'Super Agent/0.0.1',
        'Content-Type':     'application/x-www-form-urlencoded'
    }
    
    // Configure the request
    var options = {
        url: 'http://localhost:8080/api/gamemodes',
        method: 'GET',
        headers: headers,
        form: {}
    }
    var discordResponse = '';
    var maxCharacterLimit = 1500; //discord sets the max post limit to 2000, 1500 gives buffer room.
    // Start the request
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var jsonData =  JSON.parse(body);
            deleteMessages(message);
            for (var i = 0; i < jsonData.length; i++) {
                var gameMode = jsonData[i];
                discordResponse = discordResponse + '**' + gameMode.Name + ' - **' + gameMode.Description + ' by ' + gameMode.Submitter + '\n';
                if(discordResponse.length > maxCharacterLimit){
                    message.channel.send(discordResponse);
                    discordResponse = '';
                }
            }
            message.channel.send(discordResponse);
        }
    });
}

function RandomGameCommand(message, args)
{
    // Set the headers
    var headers = {
        'User-Agent':       'Super Agent/0.0.1',
        'Content-Type':     'application/x-www-form-urlencoded'
    }
    
    // Configure the request
    var options = {
        url: 'http://localhost:8080/api/gamemodes/random',
        method: 'GET',
        headers: headers,
        form: {}
    }
    var discordResponse = '';
    // Start the request
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var gameMode =  JSON.parse(body);
            discordResponse = discordResponse + '**' + gameMode.Name + ' - **' + gameMode.Description + ' by ' + gameMode.Submitter + '\n';
            message.reply(discordResponse);            
        }
    });
}

function RegisterGameCommand(message, args)
{    
    var name = args[0];
    var desc = args[1];
    var sub = args[2];
    // Set the headers
    var headers = {
        'User-Agent':       'Super Agent/0.0.1',
        'Content-Type':     'application/x-www-form-urlencoded'
    }
    
    // Configure the request
    var options = {
        url: 'http://localhost:8080/api/gamemodes',
        method: 'POST',
        headers: headers,
        form: {'GameModeId': null, 'Name': name, 'Description': desc, 'Submitter': sub}
    }
    
    // Start the request
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // Print out the response body 
            console.log(body)
        }
    })
}

function IsAdminRole(message)
{
    var adminRoleName = 'Admin';
    var adminRole = message.guild.roles.find(role => role.name == adminRoleName);
    if(adminRole == null)
    {
        return false;
    }
    return true;
}

client.login('[Token Here]');
