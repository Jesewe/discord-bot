const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

const configPath = path.join(__dirname, 'config.json');
let token;
let prefix;
let loggingEnabled = false;
let logFilePath = './bot.log';
let enableClearCommand = true;
let enableJokeCommand = true;

// Load configuration
try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    token = config.token;
    prefix = config.prefix || '!';
    loggingEnabled = config.logging.enabled;
    logFilePath = config.logging.logFilePath || logFilePath;
    enableClearCommand = config.commands.enableClearCommand !== false;
    enableJokeCommand = config.commands.enableJokeCommand !== false;
} catch (error) {
    console.error('Failed to load configuration:', error);
    process.exit(1);
}

// Logger utility with optional file logging
const logWithTime = (message) => {
    const timestamp = new Date().toLocaleString();
    const logMessage = `[${timestamp}] ${message}`;
    if (loggingEnabled) {
        fs.appendFileSync(logFilePath, logMessage + '\n');
    }
    console.log(logMessage);
};

// Error handler function
const handleError = (message, errorMessage) => {
    const errorEmbed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('Error')
        .setDescription(errorMessage);
    message.channel.send({ embeds: [errorEmbed] });
};

client.once('ready', () => {
    logWithTime(`Bot is online! Logged in as: ${client.user.tag}, prefix: ${prefix}`);
});

// Command handling
client.on('messageCreate', async (message) => {
    if (!message.content.toLowerCase().startsWith(prefix.toLowerCase()) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/\s+/);
    const command = args.shift().toLowerCase();

    logWithTime(`Command received: ${command}`);

    switch (command) {
        case 'roll':
            handleRollCommand(message, args);
            break;
        case 'joke':
            if (enableJokeCommand) handleJokeCommand(message);
            else handleError(message, 'This command is disabled.');
            break;
        case 'clear':
            if (enableClearCommand) handleClearCommand(message, args);
            else handleError(message, 'This command is disabled.');
            break;
        case 'userinfo':
            handleUserInfoCommand(message);
            break;
        case 'serverinfo':
            handleServerInfoCommand(message);
            break;
        case 'ping':
            handlePingCommand(message);
            break;
        case 'words':
            handleWordCountCommand(message, args);
            break;
        case 'who':
            handleWhoCommand(message, args);
            break;
        case 'prediction':
            handlePredictionCommand(message);
            break;
        case '8ball':
            handleEightBallCommand(message);
            break;
        case 'kick':
            handleKickCommand(message);
            break;
        case 'ban':
            handleBanCommand(message);
            break;
        case 'random_player':
            handleRandomPlayerCommand(message);
            break;
        case 'uptime':
            handleUptimeCommand(message);
            break;
        case 'today':
            handleTodayCommand(message);
            break;
        case 'fact':
            handleFactCommand(message);
            break;
        case 'mute':
            handleMuteCommand(message);
            break;
        case 'unmute':
            handleUnmuteCommand(message);
            break;
        case 'botinfo':
            handleBotInfoCommand(message);
            break;
        case 'fortune':
            handleFortuneCommand(message);
            break;
        case 'ascii':
            handleAsciiCommand(message, args);
            break;
        case 'help':
            handleHelpCommand(message);
            break;
        default:
            handleError(message, `Unknown command: ${command}. Use \`${prefix}help\` to see available commands.`);
            break;
    }
});

async function handleRollCommand(message, args) {
    let min = 1, max = 100;
    if (args.length > 0) {
        const range = args[0].split('-');
        min = parseInt(range[0], 10);
        max = parseInt(range[1], 10);
    }
    const result = Math.floor(Math.random() * (max - min + 1)) + min;
    const rollEmbed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle('🎲 Dice Roll')
        .setDescription(`You rolled: **${result}**`);
    message.channel.send({ embeds: [rollEmbed] });
}

async function handleJokeCommand(message) {
    try {
        const response = await axios.get('https://official-joke-api.appspot.com/random_joke');
        const joke = response.data;
        const jokeEmbed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('😂 Random Joke')
            .setDescription(`${joke.setup}\n\n*${joke.punchline}*`);
        message.channel.send({ embeds: [jokeEmbed] });
    } catch (error) {
        handleError(message, 'Failed to fetch a joke.');
    }
}

async function handleClearCommand(message, args) {
    const deleteCount = parseInt(args[0], 10);
    if (!deleteCount || deleteCount < 1 || deleteCount > 100) {
        return handleError(message, 'Please provide a number between 1 and 100 for the number of messages to delete.');
    }
    try {
        const fetched = await message.channel.messages.fetch({ limit: deleteCount });
        await message.channel.bulkDelete(fetched);
    } catch (error) {
        handleError(message, 'Failed to delete messages.');
    }
}

async function handleUserInfoCommand(message) {
    const target = message.mentions.users.first() || message.author;
    const userInfoEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('User Information')
        .addFields(
            { name: 'Username', value: target.username, inline: true },
            { name: 'Tag', value: target.tag, inline: true },
            { name: 'User ID', value: target.id, inline: false },
            { name: 'Joined Discord', value: target.createdAt.toDateString(), inline: false }
        )
        .setThumbnail(target.avatarURL());
    message.channel.send({ embeds: [userInfoEmbed] });
}

async function handleServerInfoCommand(message) {
    const serverInfoEmbed = new EmbedBuilder()
        .setColor(0x00FF99)
        .setTitle('Server Information')
        .addFields(
            { name: 'Server Name', value: message.guild.name, inline: true },
            { name: 'Total Members', value: `${message.guild.memberCount}`, inline: true },
            { name: 'Server Created On', value: message.guild.createdAt.toDateString(), inline: false }
        )
        .setThumbnail(message.guild.iconURL());
    message.channel.send({ embeds: [serverInfoEmbed] });
}

async function handlePingCommand(message) {
    const pingEmbed = new EmbedBuilder()
        .setColor(0x00FFFF)
        .setTitle('🏓 Ping')
        .setDescription(`Latency: ${Date.now() - message.createdTimestamp}ms`);
    message.channel.send({ embeds: [pingEmbed] });
}

async function handleWordCountCommand(message, args) {
    const text = args.join(' ');
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    message.channel.send(`Word count: ${wordCount}`);
}

async function handleWhoCommand(message, args) {
    const name = args[0];
    const adjectives = ['funny', 'smart', 'brave', 'creative', 'curious'];
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    message.channel.send(`${name} is very ${randomAdjective}.`);
}

async function handlePredictionCommand(message) {
    const predictions = ['Great success is coming!', 'Be cautious today.', 'Expect good news!', 'You will have an unexpected surprise.'];
    const randomPrediction = predictions[Math.floor(Math.random() * predictions.length)];
    message.channel.send(randomPrediction);
}

async function handleEightBallCommand(message) {
    const responses = ['Yes', 'No'];
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    message.channel.send(randomResponse);
}

async function handleKickCommand(message) {
    if (!message.member.permissions.has('KICK_MEMBERS')) {
        return handleError(message, 'You do not have permission to kick members.');
    }
    const member = message.mentions.members.first();
    if (!member) {
        return handleError(message, 'Please mention a user to kick.');
    }
    try {
        await member.kick();
        const kickEmbed = new EmbedBuilder()
            .setColor(0xFFA500)
            .setTitle('Member Kicked')
            .setDescription(`${member.user.tag} has been kicked from the server.`);
        message.channel.send({ embeds: [kickEmbed] });
    } catch (error) {
        handleError(message, 'Failed to kick the member.');
    }
}

async function handleBanCommand(message) {
    if (!message.member.permissions.has('BAN_MEMBERS')) {
        return handleError(message, 'You do not have permission to ban members.');
    }
    const member = message.mentions.members.first();
    if (!member) {
        return handleError(message, 'Please mention a user to ban.');
    }
    try {
        await member.ban();
        const banEmbed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('Member Banned')
            .setDescription(`${member.user.tag} has been banned from the server.`);
        message.channel.send({ embeds: [banEmbed] });
    } catch (error) {
        handleError(message, 'Failed to ban the member.');
    }
}

async function handleRandomPlayerCommand(message) {
    const members = message.guild.members.cache.filter(member => !member.user.bot).map(member => member.user);
    const randomMember = members[Math.floor(Math.random() * members.length)];
    message.channel.send(`Random player: ${randomMember.tag}`);
}

async function handleUptimeCommand(message) {
    const uptime = client.uptime / 1000;
    const uptimeMessage = `Bot has been online for ${Math.floor(uptime / 60)} minutes and ${Math.floor(uptime % 60)} seconds.`;
    message.channel.send(uptimeMessage);
}

async function handleTodayCommand(message) {
    try {
        const todayResponse = await axios.get('https://history.muffinlabs.com/date');
        const todayData = todayResponse.data.data.Events[0];
        const todayEmbed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('📅 On This Day in History')
            .setDescription(`${todayData.year}: ${todayData.text}`);
        message.channel.send({ embeds: [todayEmbed] });
    } catch (error) {
        handleError(message, 'Failed to fetch today\'s history event.');
    }
}

async function handleFactCommand(message) {
    try {
        const factResponse = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en');
        const fact = factResponse.data;
        message.channel.send(`💡 Random Fact: ${fact.text}`);
    } catch (error) {
        handleError(message, 'Failed to fetch a random fact.');
    }
}

async function handleMuteCommand(message) {
    const target = message.mentions.members.first();
    if (!message.member.permissions.has('MUTE_MEMBERS')) {
        return handleError(message, 'You do not have permission to mute members.');
    }
    if (!target) return handleError(message, 'Please mention a user to mute.');
    try {
        await target.voice.setMute(true);
        message.channel.send(`${target.user.tag} has been muted.`);
    } catch (error) {
        handleError(message, 'Failed to mute the member.');
    }
}

async function handleUnmuteCommand(message) {
    const target = message.mentions.members.first();
    if (!message.member.permissions.has('MUTE_MEMBERS')) {
        return handleError(message, 'You do not have permission to unmute members.');
    }
    if (!target) return handleError(message, 'Please mention a user to unmute.');
    try {
        await target.voice.setMute(false);
        message.channel.send(`${target.user.tag} has been unmuted.`);
    } catch (error) {
        handleError(message, 'Failed to unmute the member.');
    }
}

async function handleBotInfoCommand(message) {
    const bots = message.guild.members.cache.filter(member => member.user.bot);
    let botInfo = `🤖 Bots on this server: \n`;
    bots.forEach(bot => botInfo += `${bot.user.tag}\n`);
    message.channel.send(botInfo);
}

async function handleFortuneCommand(message) {
    const fortunes = ['You will have a great day!', 'Be careful today.', 'Success is coming your way!', 'An unexpected event will happen today.'];
    const randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)];
    message.channel.send(`🔮 Fortune: ${randomFortune}`);
}

async function handleAsciiCommand(message, args) {
    const text = args.join(' ');
    if (!text) return handleError(message, 'Please provide some text for ASCII conversion.');
    const figlet = require('figlet');
    figlet(text, (err, data) => {
        if (err) {
            return handleError(message, 'Failed to generate ASCII art.');
        }
        message.channel.send('```' + data + '```');
    });
}

async function handleHelpCommand(message) {
    const helpEmbed = new EmbedBuilder()
        .setColor(0x00FF99)
        .setTitle('Help - Available Commands')
        .setDescription(`Here's a list of available commands:\n
        **${prefix}roll [min-max]** - Roll a random number between min and max.\n
        **${prefix}joke** - Get a random joke.\n
        **${prefix}who [name]** - Describe a person with a random adjective.\n
        **${prefix}prediction** - Get a random prediction.\n
        **${prefix}8ball** - Get a Yes or No answer.\n
        **${prefix}ping** - Check the bot's latency.\n
        **${prefix}words [text]** - Count the number of words in a text.\n
        **${prefix}clear [number]** - Clear a specified number of messages.\n
        **${prefix}userinfo [@user]** - Get information about a user.\n
        **${prefix}serverinfo** - Get information about the server.\n
        **${prefix}random_player** - Choose a random user.\n
        **${prefix}uptime** - Find out how long the bot has been online.\n
        **${prefix}today** - Find out what happened today in history.\n
        **${prefix}fact** - Get a random fact.\n
        **${prefix}mute [@user]** - Mute a user.\n
        **${prefix}unmute [@user]** - Unmute a user.\n
        **${prefix}botinfo** - Get information on the bots in the server.\n
        **${prefix}fortune** - Get your fortune for today.\n
        **${prefix}ascii [text]** - Convert text to ASCII art.\n`);
    message.channel.send({ embeds: [helpEmbed] });
}

// Login to Discord
client.login(token);