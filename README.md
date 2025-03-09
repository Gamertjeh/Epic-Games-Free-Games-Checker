# Epic Games Free Games Bot

Welcome to the **Epic Games Free Games Discord Bot**! This bot is designed to automatically check for and announce currently free and upcoming free games on the Epic Games Store. 
It provides a seamless way to keep your Discord server informed about the latest free game offers, complete with descriptions, original prices, and direct links to claim the games.

---

## Features

- **Automatic Announcements**: The bot automatically checks for and announces currently free games and upcoming free games on the Epic Games Store.
- **Embeds**: Each announcement is sent as a rich embed, complete with game descriptions, original prices, and thumbnails.
- **Direct Links**: Buttons are included in the announcements, allowing users to directly claim the games from the Epic Games Store.
- **Scheduled Notifications**: The bot schedules notifications for when a game's free offer is about to end.
- **Manual Commands**: Use the `!upcoming` command to manually check for upcoming free games.
- **Customizable Configuration**: The bot can be configured to send announcements on startup, automatically check for new games, and more.

---

## Installation

### Prerequisites

Before running the bot, ensure you have the following:

1. **Node.js**: Download and install Node.js from [nodejs.org](https://nodejs.org/).
2. **Discord Bot Token**: You need a Discord bot token to run the bot. Follow the steps below to get one.
3. **Channel ID**: The ID of the Discord channel where the bot will send updates.

---

## Installation
 
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Gamertjeh/Epic-Games-Free-Games-Checker.git
   ```

2. **Install Dependencies**:
   Run the following command to install the required packages:
   ```bash
   npm install
   ```

3. **Set Up Configuration**:
   - Replace `YOUR_BOT_TOKEN_HERE` with your Discord bot token (see below for instructions).
   - Replace `YOUR_CHANNEL_ID_HERE` with the ID of the Discord channel where the bot will send updates.
   - automatic: Whether the bot should automatically send upcoming games after the current ones end (optional, default: true).
   - botstartup: Whether the bot should send active and upcoming games on startup (optional, default: true).

4. **Run the Bot**:
   Start the bot using:
   ```bash
   npm start
   ```

---

## How to Get a Discord Bot Token

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications).
2. Click on **New Application** and give it a name.
3. Navigate to the **Bot** tab on the left sidebar.
4. Click **Add Bot** and confirm.
5. Under the **Token** section, click **Copy** to copy your bot token.
6. Paste the token into the `config.json` file.

---

## How to Get a Channel ID

1. Open Discord and go to the server where you want the bot to send updates.
2. Right-click the channel name and select **Copy ID** (make sure Developer Mode is enabled in Discord settings).
3. Paste the channel ID into the `config.json` file.

---

## Contributing

If you'd like to contribute to this project, feel free to open an issue or submit a pull request. Contributions are welcome!

---


## Support

If you encounter any issues or have questions, feel free to open an issue on GitHub.

---

## Acknowledgments

* Plexus Development: The development team behind this bot.

* Pieter Bjorn: The main developer of this bot.

* Discord.js: The library used to interact with the Discord API.

* Epic Games Store API: The API used to fetch free game data.

---

Enjoy using the Epic Games Free Games Bot! 🎮
