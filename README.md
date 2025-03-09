# Epic Games Free Games Bot

A Discord bot that checks for free games on the Epic Games Store and sends updates to a specified channel. It automatically checks for new free games and notifies users when they are available.

---

## Features

- Fetches free games from the Epic Games Store API.
- Sends an embed with the game title, image, offer duration, and a "Get it here" button.
- Automatically checks for new free games every hour.
- Filters out games that are no longer free.

---

## Prerequisites

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

## Usage

- The bot will automatically check for free games every hour and send updates to the specified channel.

---

## Contributing

If you'd like to contribute to this project, feel free to open an issue or submit a pull request. Contributions are welcome!

---


## Support

If you encounter any issues or have questions, feel free to open an issue on GitHub.

---

Enjoy using the Epic Games Free Games Bot! 🎮
