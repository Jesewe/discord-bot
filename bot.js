const { 
  Client, 
  GatewayIntentBits, 
  EmbedBuilder, 
  PermissionsBitField 
} = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const figlet = require('figlet');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

// Load configuration
const configPath = path.join(__dirname, 'config.json');
let token;
let prefix;
let loggingEnabled = false;
let logFilePath = './bot.log';
let enableClearCommand = true;
let enableJokeCommand = true;

try {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  token = config.token;
  prefix = config.prefix || '!';
  loggingEnabled = config.logging?.enabled;
  logFilePath = config.logging?.logFilePath || logFilePath;
  enableClearCommand = config.commands?.enableClearCommand !== false;
  enableJokeCommand = config.commands?.enableJokeCommand !== false;
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

// Central error handler
const handleError = async (message, errorMessage) => {
  const errorEmbed = new EmbedBuilder()
    .setColor(0xFF0000)
    .setTitle('Error')
    .setDescription(errorMessage);
  await message.channel.send({ embeds: [errorEmbed] });
};

// Command Handlers (all commands are defined here)
const commands = {
  roll: async (message, args) => {
    let min = 1, max = 100;
    if (args.length > 0) {
      const range = args[0].split('-');
      min = parseInt(range[0], 10) || min;
      max = parseInt(range[1], 10) || max;
      if (min > max) [min, max] = [max, min]; // Swap if necessary
    }
    const result = Math.floor(Math.random() * (max - min + 1)) + min;
    const rollEmbed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle('🎲 Dice Roll')
      .setDescription(`You rolled: **${result}**`);
    await message.channel.send({ embeds: [rollEmbed] });
  },

  joke: async (message) => {
    if (!enableJokeCommand) return handleError(message, 'This command is disabled.');
    try {
      const response = await axios.get('https://official-joke-api.appspot.com/random_joke');
      const joke = response.data;
      const jokeEmbed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle('😂 Random Joke')
        .setDescription(`${joke.setup}\n\n*${joke.punchline}*`);
      await message.channel.send({ embeds: [jokeEmbed] });
    } catch (error) {
      handleError(message, 'Failed to fetch a joke.');
    }
  },

  clear: async (message, args) => {
    if (!enableClearCommand) return handleError(message, 'This command is disabled.');
    const deleteCount = parseInt(args[0], 10);
    if (!deleteCount || deleteCount < 1 || deleteCount > 100) {
      return handleError(message, 'Please provide a number between 1 and 100 for the number of messages to delete.');
    }
    try {
      const fetched = await message.channel.messages.fetch({ limit: deleteCount });
      await message.channel.bulkDelete(fetched);
      await message.channel.send(`Successfully deleted ${fetched.size} messages.`);
    } catch (error) {
      handleError(message, 'Failed to delete messages.');
    }
  },

  userinfo: async (message) => {
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
      .setThumbnail(target.displayAvatarURL());
    await message.channel.send({ embeds: [userInfoEmbed] });
  },

  serverinfo: async (message) => {
    const serverInfoEmbed = new EmbedBuilder()
      .setColor(0x00FF99)
      .setTitle('Server Information')
      .addFields(
        { name: 'Server Name', value: message.guild.name, inline: true },
        { name: 'Total Members', value: `${message.guild.memberCount}`, inline: true },
        { name: 'Server Created On', value: message.guild.createdAt.toDateString(), inline: false }
      )
      .setThumbnail(message.guild.iconURL());
    await message.channel.send({ embeds: [serverInfoEmbed] });
  },

  ping: async (message) => {
    const pingEmbed = new EmbedBuilder()
      .setColor(0x00FFFF)
      .setTitle('🏓 Ping')
      .setDescription(`Latency: ${Date.now() - message.createdTimestamp}ms`);
    await message.channel.send({ embeds: [pingEmbed] });
  },

  words: async (message, args) => {
    const text = args.join(' ');
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    await message.channel.send(`Word count: ${wordCount}`);
  },

  who: async (message, args) => {
    const name = args[0] || 'Someone';
    const adjectives = ['funny', 'smart', 'brave', 'creative', 'curious'];
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    await message.channel.send(`${name} is very ${randomAdjective}.`);
  },

  prediction: async (message) => {
    const predictions = [
      'Great success is coming!',
      'Be cautious today.',
      'Expect good news!',
      'You will have an unexpected surprise.'
    ];
    const randomPrediction = predictions[Math.floor(Math.random() * predictions.length)];
    await message.channel.send(randomPrediction);
  },

  '8ball': async (message) => {
    const responses = ['Yes', 'No', 'Maybe', 'Absolutely', 'Certainly not'];
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    await message.channel.send(randomResponse);
  },

  kick: async (message) => {
    if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
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
      await message.channel.send({ embeds: [kickEmbed] });
    } catch (error) {
      handleError(message, 'Failed to kick the member.');
    }
  },

  ban: async (message) => {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
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
      await message.channel.send({ embeds: [banEmbed] });
    } catch (error) {
      handleError(message, 'Failed to ban the member.');
    }
  },

  random_player: async (message) => {
    const members = message.guild.members.cache.filter(member => !member.user.bot).map(member => member.user);
    if (members.length === 0) return handleError(message, 'No non-bot members found.');
    const randomMember = members[Math.floor(Math.random() * members.length)];
    await message.channel.send(`Random player: ${randomMember.tag}`);
  },

  uptime: async (message) => {
    const uptimeSeconds = client.uptime / 1000;
    const minutes = Math.floor(uptimeSeconds / 60);
    const seconds = Math.floor(uptimeSeconds % 60);
    await message.channel.send(`Bot has been online for ${minutes} minutes and ${seconds} seconds.`);
  },

  today: async (message) => {
    try {
      const todayResponse = await axios.get('https://history.muffinlabs.com/date');
      const todayData = todayResponse.data.data.Events[0];
      const todayEmbed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle('📅 On This Day in History')
        .setDescription(`${todayData.year}: ${todayData.text}`);
      await message.channel.send({ embeds: [todayEmbed] });
    } catch (error) {
      handleError(message, "Failed to fetch today's history event.");
    }
  },

  fact: async (message) => {
    try {
      const factResponse = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en');
      const fact = factResponse.data;
      await message.channel.send(`💡 Random Fact: ${fact.text}`);
    } catch (error) {
      handleError(message, 'Failed to fetch a random fact.');
    }
  },

  mute: async (message) => {
    if (!message.member.permissions.has(PermissionsBitField.Flags.MuteMembers)) {
      return handleError(message, 'You do not have permission to mute members.');
    }
    const target = message.mentions.members.first();
    if (!target) return handleError(message, 'Please mention a user to mute.');
    try {
      if (!target.voice.channel) return handleError(message, 'User is not in a voice channel.');
      await target.voice.setMute(true);
      await message.channel.send(`${target.user.tag} has been muted.`);
    } catch (error) {
      handleError(message, 'Failed to mute the member.');
    }
  },

  unmute: async (message) => {
    if (!message.member.permissions.has(PermissionsBitField.Flags.MuteMembers)) {
      return handleError(message, 'You do not have permission to unmute members.');
    }
    const target = message.mentions.members.first();
    if (!target) return handleError(message, 'Please mention a user to unmute.');
    try {
      if (!target.voice.channel) return handleError(message, 'User is not in a voice channel.');
      await target.voice.setMute(false);
      await message.channel.send(`${target.user.tag} has been unmuted.`);
    } catch (error) {
      handleError(message, 'Failed to unmute the member.');
    }
  },

  botinfo: async (message) => {
    const bots = message.guild.members.cache.filter(member => member.user.bot);
    let botInfo = `🤖 Bots on this server:\n`;
    bots.forEach(bot => botInfo += `${bot.user.tag}\n`);
    await message.channel.send(botInfo);
  },

  fortune: async (message) => {
    const fortunes = [
      'You will have a great day!',
      'Be careful today.',
      'Success is coming your way!',
      'An unexpected event will happen today.'
    ];
    const randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)];
    await message.channel.send(`🔮 Fortune: ${randomFortune}`);
  },

  ascii: async (message, args) => {
    const text = args.join(' ');
    if (!text) return handleError(message, 'Please provide some text for ASCII conversion.');
    figlet(text, (err, data) => {
      if (err) {
        return handleError(message, 'Failed to generate ASCII art.');
      }
      message.channel.send('```' + data + '```');
    });
  },

  help: async (message) => {
    const helpEmbed = new EmbedBuilder()
      .setColor(0x00FF99)
      .setTitle('Help - Available Commands')
      .setDescription(`Here's a list of available commands:
**${prefix}roll [min-max]** - Roll a random number between min and max.
**${prefix}joke** - Get a random joke.
**${prefix}who [name]** - Describe a person with a random adjective.
**${prefix}prediction** - Get a random prediction.
**${prefix}8ball** - Get a Yes/No answer.
**${prefix}ping** - Check the bot's latency.
**${prefix}words [text]** - Count the number of words in a text.
**${prefix}clear [number]** - Clear a specified number of messages.
**${prefix}userinfo [@user]** - Get information about a user.
**${prefix}serverinfo** - Get information about the server.
**${prefix}random_player** - Choose a random user.
**${prefix}uptime** - Find out how long the bot has been online.
**${prefix}today** - Find out what happened today in history.
**${prefix}fact** - Get a random fact.
**${prefix}mute [@user]** - Mute a user in voice channels.
**${prefix}unmute [@user]** - Unmute a user in voice channels.
**${prefix}botinfo** - Get information on the bots in the server.
**${prefix}fortune** - Get your fortune for today.
**${prefix}ascii [text]** - Convert text to ASCII art.
**${prefix}quote** - Get an inspirational quote.
**${prefix}timer [seconds]** - Set a timer.
**${prefix}crypto [coin]** - Get the current price of a cryptocurrency (default: bitcoin).
**${prefix}avatar [@user]** - Get the avatar of a user.
`);
    await message.channel.send({ embeds: [helpEmbed] });
  },

  // New Feature: Inspirational Quote
  quote: async (message) => {
    try {
      const response = await axios.get('https://zenquotes.io/api/random');
      const data = response.data;
      if (Array.isArray(data) && data.length > 0) {
        const quoteData = data[0];
        const quoteEmbed = new EmbedBuilder()
          .setColor(0x00CED1)
          .setTitle('Inspirational Quote')
          .setDescription(`"${quoteData.q}"\n- ${quoteData.a}`);
        await message.channel.send({ embeds: [quoteEmbed] });
      } else {
        handleError(message, 'Failed to retrieve a quote.');
      }
    } catch (error) {
      handleError(message, 'Failed to fetch a quote.');
    }
  },

  // New Feature: Timer Command
  timer: async (message, args) => {
    const seconds = parseInt(args[0], 10);
    if (isNaN(seconds) || seconds <= 0) {
      return handleError(message, 'Please provide a valid number of seconds for the timer.');
    }
    await message.channel.send(`⏳ Timer set for ${seconds} seconds.`);
    setTimeout(() => {
      message.channel.send(`${message.author}, your timer for ${seconds} seconds is up!`);
    }, seconds * 1000);
  },

  // New Feature: Cryptocurrency Price Checker
  crypto: async (message, args) => {
    const coin = args[0] ? args[0].toLowerCase() : 'bitcoin';
    try {
      const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd`);
      const priceData = response.data;
      if (!priceData[coin]) {
        return handleError(message, 'Coin not found or unsupported.');
      }
      const price = priceData[coin].usd;
      const cryptoEmbed = new EmbedBuilder()
        .setColor(0xFFD700)
        .setTitle(`Crypto Price: ${coin.charAt(0).toUpperCase() + coin.slice(1)}`)
        .setDescription(`Current price: $${price} USD`);
      await message.channel.send({ embeds: [cryptoEmbed] });
    } catch (error) {
      handleError(message, 'Failed to fetch cryptocurrency data.');
    }
  },

  // New Feature: Avatar Command
  avatar: async (message) => {
    const target = message.mentions.users.first() || message.author;
    const avatarEmbed = new EmbedBuilder()
      .setColor(0x00BFFF)
      .setTitle(`${target.username}'s Avatar`)
      .setImage(target.displayAvatarURL({ dynamic: true, size: 512 }));
    await message.channel.send({ embeds: [avatarEmbed] });
  }
};

// When the bot is ready
client.once('ready', () => {
  logWithTime(`Bot is online! Logged in as: ${client.user.tag}, prefix: ${prefix}`);
});

// Command Handling
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.toLowerCase().startsWith(prefix.toLowerCase())) return;

  const args = message.content.slice(prefix.length).trim().split(/\s+/);
  const commandName = args.shift().toLowerCase();

  logWithTime(`Command received: ${commandName} from ${message.author.tag}`);

  const command = commands[commandName];
  if (!command) {
    return handleError(message, `Unknown command: ${commandName}. Use \`${prefix}help\` to see available commands.`);
  }

  try {
    await command(message, args);
  } catch (error) {
    logWithTime(`Error executing command ${commandName}: ${error}`);
    handleError(message, 'An error occurred while executing the command.');
  }
});

// Login to Discord
client.login(token);