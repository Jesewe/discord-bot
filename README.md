<div align="center">
   <img src="src/img/icon.png" alt="Discord Bot" width="200" height="200">
   <h1>🤖 Ultimate Discord Bot 🤖</h1>
   <p>The all-in-one bot for moderation, fun, and utility in your Discord server.</p>
   <a href="#features"><strong>Features</strong></a> •
   <a href="#installation"><strong>Installation</strong></a> •
   <a href="#dependencies"><strong>Dependencies</strong></a> •
   <a href="#logging"><strong>Logging</strong></a>
</div>

---

## Overview

**Ultimate Discord Bot** is a powerful and flexible bot built using the [Discord.js](https://discord.js.org/) library. It's designed to enhance your Discord server with a wide range of features, from server moderation tools to fun and engaging commands for your community. The bot integrates external APIs for jokes, history facts, and random trivia, making it a versatile tool for any server.

## Features

### General Commands
- **`roll [min-max]`**: Roll a random number within a given range (default: 1-100).
- **`joke`**: Fetch a random joke from an external API.
- **`who [name]`**: Generate a random adjective for the given name.
- **`prediction`**: Get a random prediction about your future.
- **`8ball`**: Ask a yes/no question and get an answer.
- **`ping`**: Check the bot's response time.
- **`words [text]`**: Count the number of words in the provided text.
- **`clear [number]`**: Delete up to 100 recent messages in the current channel.

### Moderation Commands
- **`kick [@user]`**: Kick a user from the server.
- **`ban [@user]`**: Ban a user from the server.
- **`mute [@user]`**: Mute a user in voice channels.
- **`unmute [@user]`**: Unmute a user in voice channels.

### Server Information Commands
- **`userinfo [@user]`**: Get details about a user (username, tag, ID, etc.).
- **`serverinfo`**: Display server information (name, member count, etc.).
- **`random_player`**: Select a random member from the server.
- **`botinfo`**: List all bots currently in the server.

### Fun & Miscellaneous Commands
- **`uptime`**: See how long the bot has been running.
- **`today`**: Discover a historical event that occurred on today's date.
- **`fact`**: Get a random fun fact from an external API.
- **`ascii [text]`**: Convert text into ASCII art.
- **`fortune`**: Receive a fortune prediction for your day.

## Prerequisites

Before running the bot, ensure you have the following:
- A [Discord developer account](https://discord.com/developers/applications) and a bot token.
- Node.js (v16.6.0 or higher) installed on your machine.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Jesewe/discord-bot.git
   ```

2. Navigate to the project directory:
   ```bash
   cd discord-bot
   ```

3. Install the required dependencies:
   ```bash
   npm install
   ```

4. Create a `config.json` file in the project root and add your bot token and prefix:
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

- [Discord.js](https://discord.js.org/): A JavaScript library to interact with the Discord API.
- [Axios](https://axios-http.com/): A promise-based HTTP client for making API calls.
- [Figlet](https://www.npmjs.com/package/figlet): Used to generate ASCII art from text.

## Logging

The bot logs each command execution along with timestamps for easy monitoring. By default, logs are written to both the console and an optional log file if logging is enabled in the `config.json`. Example log format:
```
[MM/DD/YYYY, HH:MM:SS AM/PM] Command executed: !roll
```

To enable file logging, configure the `logFilePath` in `config.json`:
```json
{
    "logging": {
        "enabled": true,
        "logFilePath": "./bot.log"
    }
}
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.