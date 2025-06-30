const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField } = require('discord.js');
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
let commandConfig = {};
let bannedWords = [];
let bannedWordsPattern;

try {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  token = config.token;
  prefix = config.prefix || '!';
  loggingEnabled = config.logging?.enabled;
  logFilePath = config.logging?.logFilePath || logFilePath;
  commandConfig = {
    enableClearCommand: config.commands?.enableClearCommand !== false,
    enableJokeCommand: config.commands?.enableJokeCommand !== false,
    enableRollCommand: config.commands?.enableRollCommand !== false,
    enableUserinfoCommand: config.commands?.enableUserinfoCommand !== false,
    enableServerinfoCommand: config.commands?.enableServerinfoCommand !== false,
    enablePingCommand: config.commands?.enablePingCommand !== false,
    enableWordsCommand: config.commands?.enableWordsCommand !== false,
    enableWhoCommand: config.commands?.enableWhoCommand !== false,
    enablePredictionCommand: config.commands?.enablePredictionCommand !== false,
    enable8ballCommand: config.commands?.enable8ballCommand !== false,
    enableKickCommand: config.commands?.enableKickCommand !== false,
    enableBanCommand: config.commands?.enableBanCommand !== false,
    enableRandomPlayerCommand: config.commands?.enableRandomPlayerCommand !== false,
    enableUptimeCommand: config.commands?.enableUptimeCommand !== false,
    enableTodayCommand: config.commands?.enableTodayCommand !== false,
    enableFactCommand: config.commands?.enableFactCommand !== false,
    enableMuteCommand: config.commands?.enableMuteCommand !== false,
    enableUnmuteCommand: config.commands?.enableUnmuteCommand !== false,
    enableBotinfoCommand: config.commands?.enableBotinfoCommand !== false,
    enableFortuneCommand: config.commands?.enableFortuneCommand !== false,
    enableAsciiCommand: config.commands?.enableAsciiCommand !== false,
    enableHelpCommand: config.commands?.enableHelpCommand !== false,
    enableQuoteCommand: config.commands?.enableQuoteCommand !== false,
    enableTimerCommand: config.commands?.enableTimerCommand !== false,
    enableCryptoCommand: config.commands?.enableCryptoCommand !== false,
    enableAvatarCommand: config.commands?.enableAvatarCommand !== false,
    enableCustomembedCommand: config.commands?.enableCustomembedCommand !== false,
    enableCatCommand: config.commands?.enableCatCommand !== false,
    enableDogCommand: config.commands?.enableDogCommand !== false,
    enableMemeCommand: config.commands?.enableMemeCommand !== false,
    enableWeatherCommand: config.commands?.enableWeatherCommand !== false,
    enableTriviaCommand: config.commands?.enableTriviaCommand !== false,
    enableReminderCommand: config.commands?.enableReminderCommand !== false,
    enablePollCommand: config.commands?.enablePollCommand !== false,
  };
  bannedWords = config.autoModeration?.bannedWords || [];
  if (bannedWords.length > 0) {
    bannedWordsPattern = new RegExp('\\b(' + bannedWords.join('|') + ')\\b', 'i');
  }
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
    if (!commandConfig.enableRollCommand) return handleError(message, 'This command is disabled.');
    let min = 1, max = 100;
    if (args.length > 0) {
      const range = args[0].split('-');
      min = parseInt(range[0], 10) || min;
      max = parseInt(range[1], 10) || max;
      if (min > max) [min, max] = [max, min];
    }
    const result = Math.floor(Math.random() * (max - min + 1)) + min;
    const rollEmbed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle('🎲 Dice Roll')
      .setDescription(`You rolled: **${result}**`);
    await message.channel.send({ embeds: [rollEmbed] });
  },

  joke: async (message) => {
    if (!commandConfig.enableJokeCommand) return handleError(message, 'This command is disabled.');
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
    if (!commandConfig.enableClearCommand) return handleError(message, 'This command is disabled.');
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
    if (!commandConfig.enableUserinfoCommand) return handleError(message, 'This command is disabled.');
    const target = message.mentions.users.first() || message.author;
    if (!message.guild) {
      const userInfoEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('User Information')
        .addFields(
          { name: 'Username', value: target.username, inline: true },
          { name: 'Tag', value: target.tag, inline: true },
          { name: 'User ID', value: target.id, inline: false },
          { name: 'Joined Discord', value: target.createdAt.toDateString(), inline: false },
          { name: 'Note', value: 'Additional server-specific info unavailable in DMs.', inline: false }
        )
        .setThumbnail(target.displayAvatarURL());
      return await message.channel.send({ embeds: [userInfoEmbed] });
    }
    // Fetch member data for guild context
    let member;
    try {
      member = await message.guild.members.fetch(target.id);
    } catch (error) {
      logWithTime(`Error fetching member data for ${target.tag}: ${error}`);
      return handleError(message, 'Failed to fetch member data.');
    }
    const userInfoEmbed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle('User Information')
      .addFields(
        { name: 'Username', value: target.username, inline: true },
        { name: 'Tag', value: target.tag, inline: true },
        { name: 'User ID', value: target.id, inline: false },
        { name: 'Joined Discord', value: target.createdAt.toDateString(), inline: false },
        { name: 'Joined Server', value: member.joinedAt.toDateString(), inline: false },
        { name: 'Roles', value: member.roles.cache.map(role => role.name).join(', ') || 'None', inline: false }
      )
      .setThumbnail(target.displayAvatarURL());
    await message.channel.send({ embeds: [userInfoEmbed] });
  },

  serverinfo: async (message) => {
    if (!commandConfig.enableServerinfoCommand) return handleError(message, 'This command is disabled.');
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
    if (!commandConfig.enablePingCommand) return handleError(message, 'This command is disabled.');
    const pingEmbed = new EmbedBuilder()
      .setColor(0x00FFFF)
      .setTitle('🏓 Ping')
      .setDescription(`Latency: ${Date.now() - message.createdTimestamp}ms`);
    await message.channel.send({ embeds: [pingEmbed] });
  },

  words: async (message, args) => {
    if (!commandConfig.enableWordsCommand) return handleError(message, 'This command is disabled.');
    const text = args.join(' ');
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    await message.channel.send(`Word count: ${wordCount}`);
  },

  who: async (message, args) => {
    if (!commandConfig.enableWhoCommand) return handleError(message, 'This command is disabled.');
    const name = args[0] || 'Someone';
    const adjectives = ['funny', 'smart', 'brave', 'creative', 'curious'];
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    await message.channel.send(`${name} is very ${randomAdjective}.`);
  },

  prediction: async (message) => {
    if (!commandConfig.enablePredictionCommand) return handleError(message, 'This command is disabled.');
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
    if (!commandConfig.enable8ballCommand) return handleError(message, 'This command is disabled.');
    const responses = ['Yes', 'No', 'Maybe', 'Absolutely', 'Certainly not'];
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    await message.channel.send(randomResponse);
  },

  kick: async (message) => {
    if (!commandConfig.enableKickCommand) return handleError(message, 'This command is disabled.');
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
    if (!commandConfig.enableBanCommand) return handleError(message, 'This command is disabled.');
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
    if (!commandConfig.enableRandomPlayerCommand) return handleError(message, 'This command is disabled.');
    const members = message.guild.members.cache.filter(member => !member.user.bot).map(member => member.user);
    if (members.length === 0) return handleError(message, 'No non-bot members found.');
    const randomMember = members[Math.floor(Math.random() * members.length)];
    await message.channel.send(`Random player: ${randomMember.tag}`);
  },

  uptime: async (message) => {
    if (!commandConfig.enableUptimeCommand) return handleError(message, 'This command is disabled.');
    const uptimeSeconds = client.uptime / 1000;
    const minutes = Math.floor(uptimeSeconds / 60);
    const seconds = Math.floor(uptimeSeconds % 60);
    await message.channel.send(`Bot has been online for ${minutes} minutes and ${seconds} seconds.`);
  },

  today: async (message) => {
    if (!commandConfig.enableTodayCommand) return handleError(message, 'This command is disabled.');
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
    if (!commandConfig.enableFactCommand) return handleError(message, 'This command is disabled.');
    try {
      const factResponse = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en');
      const fact = factResponse.data;
      await message.channel.send(`💡 Random Fact: ${fact.text}`);
    } catch (error) {
      handleError(message, 'Failed to fetch a random fact.');
    }
  },

  mute: async (message) => {
    if (!commandConfig.enableMuteCommand) return handleError(message, 'This command is disabled.');
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
    if (!commandConfig.enableUnmuteCommand) return handleError(message, 'This command is disabled.');
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
    if (!commandConfig.enableBotinfoCommand) return handleError(message, 'This command is disabled.');
    const bots = message.guild.members.cache.filter(member => member.user.bot);
    let botInfo = `🤖 Bots on this server:\n`;
    bots.forEach(bot => botInfo += `${bot.user.tag}\n`);
    await message.channel.send(botInfo);
  },

  fortune: async (message) => {
    if (!commandConfig.enableFortuneCommand) return handleError(message, 'This command is disabled.');
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
    if (!commandConfig.enableAsciiCommand) return handleError(message, 'This command is disabled.');
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
    if (!commandConfig.enableHelpCommand) return handleError(message, 'This command is disabled.');
    const commandDescriptions = {
      roll: `**${prefix}roll [min-max]** - Roll a random number between min and max.`,
      joke: `**${prefix}joke** - Get a random joke.`,
      clear: `**${prefix}clear [number]** - Clear a specified number of messages.`,
      userinfo: `**${prefix}userinfo [@user]** - Get information about a user.`,
      serverinfo: `**${prefix}serverinfo** - Get information about the server.`,
      ping: `**${prefix}ping** - Check the bot's latency.`,
      words: `**${prefix}words [text]** - Count the number of words in a text.`,
      who: `**${prefix}who [name]** - Describe a person with a random adjective.`,
      prediction: `**${prefix}prediction** - Get a random prediction.`,
      '8ball': `**${prefix}8ball** - Get a Yes/No answer.`,
      kick: `**${prefix}kick [@user]** - Kick a user from the server.`,
      ban: `**${prefix}ban [@user]** - Ban a user from the server.`,
      random_player: `**${prefix}random_player** - Choose a random user.`,
      uptime: `**${prefix}uptime** - Find out how long the bot has been online.`,
      today: `**${prefix}today** - Find out what happened today in history.`,
      fact: `**${prefix}fact** - Get a random fact.`,
      mute: `**${prefix}mute [@user]** - Mute a user in voice channels.`,
      unmute: `**${prefix}unmute [@user]** - Unmute a user in voice channels.`,
      botinfo: `**${prefix}botinfo** - Get information on the bots in the server.`,
      fortune: `**${prefix}fortune** - Get your fortune for today.`,
      ascii: `**${prefix}ascii [text]** - Convert text to ASCII art.`,
      quote: `**${prefix}quote** - Get an inspirational quote.`,
      timer: `**${prefix}timer [seconds]** - Set a timer.`,
      crypto: `**${prefix}crypto [coin]** - Get the current price of a cryptocurrency.`,
      avatar: `**${prefix}avatar [@user]** - Get the avatar of a user.`,
      customembed: `**${prefix}customembed Title; Description; [optional hex color]** - Create a custom embed message.`,
      cat: `**${prefix}cat** - Get a random cat image.`,
      dog: `**${prefix}dog** - Get a random dog image.`,
      meme: `**${prefix}meme** - Fetch a random meme.`,
      weather: `**${prefix}weather [location]** - Get current weather information for a location.`,
      trivia: `**${prefix}trivia** - Get a random trivia question.`,
      reminder: `**${prefix}reminder [seconds] [message]** - Set a personal reminder.`,
      poll: `**${prefix}poll Question | Option1 | Option2 | ...** - Create a poll with up to 10 options.`,
    };
    // Filter enabled commands
    const enabledCommands = Object.keys(commands)
      .filter(cmd => commandConfig[`enable${cmd.charAt(0).toUpperCase() + cmd.slice(1)}Command`])
      .map(cmd => commandDescriptions[cmd])
      .join('\n');
    const helpEmbed = new EmbedBuilder()
      .setColor(0x00FF99)
      .setTitle('Help - Available Commands')
      .setDescription(`Here's a list of available commands:\n${enabledCommands || 'No commands are currently enabled.'}`);
    await message.channel.send({ embeds: [helpEmbed] });
  },

  quote: async (message) => {
    if (!commandConfig.enableQuoteCommand) return handleError(message, 'This command is disabled.');
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

  timer: async (message, args) => {
    if (!commandConfig.enableTimerCommand) return handleError(message, 'This command is disabled.');
    const seconds = parseInt(args[0], 10);
    if (isNaN(seconds) || seconds <= 0) {
      return handleError(message, 'Please provide a valid number of seconds for the timer.');
    }
    await message.channel.send(`⏳ Timer set for ${seconds} seconds.`);
    setTimeout(() => {
      message.channel.send(`${message.author}, your timer for ${seconds} seconds is up!`);
    }, seconds * 1000);
  },

  crypto: async (message, args) => {
    if (!commandConfig.enableCryptoCommand) return handleError(message, 'This command is disabled.');
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
        .setDescription(`Current price: ${price} USD`);
      await message.channel.send({ embeds: [cryptoEmbed] });
    } catch (error) {
      handleError(message, 'Failed to fetch cryptocurrency data.');
    }
  },

  avatar: async (message) => {
    if (!commandConfig.enableAvatarCommand) return handleError(message, 'This command is disabled.');
    const target = message.mentions.users.first() || message.author;
    const avatarEmbed = new EmbedBuilder()
      .setColor(0x00BFFF)
      .setTitle(`${target.username}'s Avatar`)
      .setImage(target.displayAvatarURL({ dynamic: true, size: 512 }));
    await message.channel.send({ embeds: [avatarEmbed] });
  },

  customembed: async (message, args) => {
    if (!commandConfig.enableCustomembedCommand) return handleError(message, 'This command is disabled.');
    if (args.length === 0) {
      return handleError(message, 'Please provide your embed content in the format: `Title; Description; [optional hex color]`.');
    }
    const input = args.join(' ');
    const parts = input.split(';');
    if (parts.length < 2) {
      return handleError(message, 'Please separate the title and description with a semicolon.');
    }
    const title = parts[0].trim();
    const description = parts[1].trim();
    let color = 0x00FF00;
    if (parts[2]) {
      color = parseInt(parts[2].trim().replace(/^#/, ''), 16) || color;
    }
    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor(color);
    await message.channel.send({ embeds: [embed] });
  },

  cat: async (message) => {
    if (!commandConfig.enableCatCommand) return handleError(message, 'This command is disabled.');
    try {
      const response = await axios.get('https://aws.random.cat/meow');
      const imageUrl = response.data.file;
      const catEmbed = new EmbedBuilder()
        .setColor(0xFFA07A)
        .setTitle('Random Cat')
        .setImage(imageUrl);
      await message.channel.send({ embeds: [catEmbed] });
    } catch (error) {
      handleError(message, 'Failed to fetch a cat image.');
    }
  },

  dog: async (message) => {
    if (!commandConfig.enableDogCommand) return handleError(message, 'This command is disabled.');
    try {
      const response = await axios.get('https://dog.ceo/api/breeds/image/random');
      const imageUrl = response.data.message;
      const dogEmbed = new EmbedBuilder()
        .setColor(0x87CEFA)
        .setTitle('Random Dog')
        .setImage(imageUrl);
      await message.channel.send({ embeds: [dogEmbed] });
    } catch (error) {
      handleError(message, 'Failed to fetch a dog image.');
    }
  },

  meme: async (message) => {
    if (!commandConfig.enableMemeCommand) return handleError(message, 'This command is disabled.');
    try {
      const response = await axios.get('https://meme-api.com/gimme');
      const memeData = response.data;
      const memeEmbed = new EmbedBuilder()
        .setColor(0xFF4500)
        .setTitle(memeData.title)
        .setImage(memeData.url)
        .setFooter({ text: `From: ${memeData.subreddit}` });
      await message.channel.send({ embeds: [memeEmbed] });
    } catch (error) {
      handleError(message, 'Failed to fetch a meme.');
    }
  },

  weather: async (message, args) => {
    if (!commandConfig.enableWeatherCommand) return handleError(message, 'This command is disabled.');
    if (args.length === 0) return handleError(message, 'Please provide a location for weather information.');
    const location = args.join(' ');
    try {
      const response = await axios.get(`http://wttr.in/${encodeURIComponent(location)}?format=j1`);
      const data = response.data;
      const current = data.current_condition[0];
      const weatherEmbed = new EmbedBuilder()
        .setColor(0x1E90FF)
        .setTitle(`Weather in ${location}`)
        .addFields(
          { name: 'Temperature', value: `${current.temp_C}°C`, inline: true },
          { name: 'Feels Like', value: `${current.FeelsLikeC}°C`, inline: true },
          { name: 'Description', value: current.weatherDesc[0].value, inline: false }
        );
      await message.channel.send({ embeds: [weatherEmbed] });
    } catch (error) {
      handleError(message, 'Failed to fetch weather data.');
    }
  },

  trivia: async (message) => {
    if (!commandConfig.enableTriviaCommand) return handleError(message, 'This command is disabled.');
    try {
      const response = await axios.get('https://opentdb.com/api.php?amount=1&type=multiple');
      const triviaData = response.data.results[0];
      const question = triviaData.question;
      const correctAnswer = triviaData.correct_answer;
      const incorrectAnswers = triviaData.incorrect_answers;
      const answers = [...incorrectAnswers, correctAnswer].sort(() => Math.random() - 0.5);
      const triviaEmbed = new EmbedBuilder()
        .setColor(0x32CD32)
        .setTitle('Trivia Question')
        .setDescription(question)
        .addFields(
          { name: 'Options', value: answers.join('\n') },
          { name: 'Note', value: 'The correct answer is hidden!' }
        );
      await message.channel.send({ embeds: [triviaEmbed] });
    } catch (error) {
      handleError(message, 'Failed to fetch a trivia question.');
    }
  },

  reminder: async (message, args) => {
    if (!commandConfig.enableReminderCommand) return handleError(message, 'This command is disabled.');
    const seconds = parseInt(args[0], 10);
    if (isNaN(seconds) || seconds <= 0) {
      return handleError(message, 'Please provide a valid number of seconds for the reminder.');
    }
    const reminderMessage = args.slice(1).join(' ');
    if (!reminderMessage) return handleError(message, 'Please provide a reminder message.');
    await message.channel.send(`⏰ I will remind you in ${seconds} seconds.`);
    setTimeout(() => {
      message.author.send(`Reminder: ${reminderMessage}`);
    }, seconds * 1000);
  },

  poll: async (message, args) => {
    if (!commandConfig.enablePollCommand) return handleError(message, 'This command is disabled.');
    const fullArgs = message.content.slice(prefix.length + 'poll'.length).trim();
    const parts = fullArgs.split('|').map(part => part.trim());
    if (parts.length < 2) {
      return handleError(message, 'Usage: !poll Question | Option1 | Option2 | ...');
    }
    const question = parts[0];
    const options = parts.slice(1);
    if (options.length > 10) {
      return handleError(message, 'Maximum of 10 options allowed.');
    }
    const pollEmbed = new EmbedBuilder()
      .setColor(0xFFD700)
      .setTitle('Poll')
      .setDescription(question);
    options.forEach((option, index) => {
      const emoji = String.fromCodePoint(0x1F1E6 + index);
      pollEmbed.addFields({ name: emoji, value: option, inline: true });
    });
    const pollMessage = await message.channel.send({ embeds: [pollEmbed] });
    for (let i = 0; i < options.length; i++) {
      const emoji = String.fromCodePoint(0x1F1E6 + i);
      await pollMessage.react(emoji);
    }
  }
};

// Auto Moderation: Delete messages containing banned words from config
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  const messageContent = message.content.toLowerCase();
  if (bannedWordsPattern && bannedWordsPattern.test(messageContent)) {
    const matchedWord = messageContent.match(bannedWordsPattern)[0];
    try {
      await message.delete();
      await message.channel.send(`${message.author}, your message contained inappropriate language ("${matchedWord}") and was removed.`);
      logWithTime(`Auto moderation: Deleted message from ${message.author.tag} for banned word: ${matchedWord}`);
    } catch (error) {
      console.error(`Error deleting message from ${message.author.tag}:`, error);
    }
    return;
  }
});

// When the bot is ready
client.once('ready', () => {
  logWithTime(`Bot is online! Logged in as: ${client.user.tag}, prefix: ${prefix}`);
});

// Command Handling with Cooldowns
const commandCooldowns = new Map();
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

  // Cooldown check
  const cooldownTime = 5000; // 5 seconds
  const now = Date.now();
  let userCooldowns = commandCooldowns.get(commandName);
  if (!userCooldowns) {
    userCooldowns = new Map();
    commandCooldowns.set(commandName, userCooldowns);
  }
  const lastUsed = userCooldowns.get(message.author.id) || 0;
  if (now - lastUsed < cooldownTime) {
    const timeLeft = Math.ceil((cooldownTime - (now - lastUsed)) / 1000);
    return handleError(message, `Please wait ${timeLeft} seconds before using this command again.`);
  }

  try {
    await command(message, args);
    userCooldowns.set(message.author.id, now);
  } catch (error) {
    logWithTime(`Error executing command ${commandName}: ${error}`);
    handleError(message, 'An error occurred while executing the command.');
  }
});

// Login to Discord
client.login(token);