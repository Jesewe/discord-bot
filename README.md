<div align="center">
   <img src="src/img/icon.png" alt="Discord Bot" width="200" height="200">
   <h1>Discord Bot</h1>
   <p>Your multifunctional Discord bot.</p>
   <a href="#features"><strong>Features</strong></a> •
   <a href="#installation"><strong>Installation</strong></a> •
   <a href="#dependencies"><strong>Dependencies</strong></a> •
   <a href="#logging"><strong>Logging</strong></a>
</div>

---

## Overview

This project is a multifunctional Discord bot built using the [Discord.js](https://discord.js.org/) library. The bot includes a variety of commands for entertainment, server moderation, and utility purposes. It supports interaction with the Discord API to fetch user and server information, interact with members, and even pull data from external APIs like joke generators or history facts.

## Features

- **General Commands**
  - `roll [min-max]`: Rolls a random number between the specified range (defaults to 1-100).
  - `joke`: Fetches a random joke from an external API.
  - `who [name]`: Describes a person with a random adjective.
  - `prediction`: Provides a random prediction.
  - `8ball`: Gives a yes or no answer.
  - `ping`: Checks the bot's latency.
  - `words [text]`: Counts the number of words in a given text.
  - `clear [number]`: Clears a specified number of messages in the current channel (up to 100).
  
- **Server Moderation Commands**
  - `kick [@user]`: Kicks a user from the server.
  - `ban [@user]`: Bans a user from the server.
  - `mute [@user]`: Mutes a user in voice channels.
  - `unmute [@user]`: Unmutes a user in voice channels.

- **Server Information Commands**
  - `userinfo [@user]`: Fetches information about a specific user (username, tag, user ID, etc.).
  - `serverinfo`: Displays basic information about the server (server name, member count, etc.).
  - `random_player`: Selects a random player from the server.
  - `botinfo`: Lists all the bots in the server.

- **Fun & Miscellaneous Commands**
  - `uptime`: Displays the bot's current uptime.
  - `today`: Shows an event that occurred on this day in history.
  - `fact`: Fetches a random fact from an external API.
  - `ascii [text]`: Converts provided text into ASCII art.
  - `fortune`: Provides a random fortune prediction for the day.

## Prerequisites

To use this bot, you must have:
- A [Discord developer account](https://discord.com/developers/applications) with a bot token.
- Node.js installed on your machine (v16.6.0 or higher).

## Installation

1. Clone the repository or download the source code:
   ```bash
   git clone https://github.com/Jesewe/discord-bot.git
   ```

2. Navigate to the project folder:
   ```bash
   cd discord-bot
   ```

3. Install the necessary dependencies:
   ```bash
   npm install
   ```

4. Create a `config.json` file in the root directory and add your bot token and command prefix:
   ```json
   {
       "token": "YOUR_BOT_TOKEN",
       "prefix": "!"
   }
   ```

5. Start the bot:
   ```bash
   node bot.js
   ```

## Dependencies

- [Discord.js](https://discord.js.org/) - A powerful JavaScript library for interacting with the Discord API.
- [Axios](https://axios-http.com/) - A promise-based HTTP client for making API requests.
- [Figlet](https://www.npmjs.com/package/figlet) - Used to convert text into ASCII art.

## Logging

The bot logs every command execution with a timestamp. You can find the logging format in the `bot.js` file with the `logWithTime` function, which logs messages in the format:
```
[MM/DD/YYYY, HH:MM:SS AM/PM] Bot is online! Name: BotName. Using prefix: !
```

## How to Add More Commands

To add more commands, simply extend the `messageCreate` event listener in the `bot.js` file. Here's an example structure:

```javascript
if (command === 'newcommand') {
    // Your new command logic here
    message.channel.send('This is a new command!');
}
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.