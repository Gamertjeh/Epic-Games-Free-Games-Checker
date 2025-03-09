const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
const fs = require('fs'); // Import the fs module to read files (maybe needed?)

// Read the config from config.json
const { token, channelId } = require('./config.json');

// Create a new Discord client
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

// Function to fetch free games from Epic Games Store
async function getFreeGames() {
  try {
    const response = await axios.get('https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions');
    const games = response.data.data.Catalog.searchStore.elements;

    const freeGames = games.filter(
      (game) => game.promotions && game.promotions.promotionalOffers.length > 0
    );

    return freeGames.map((game) => {
      const promotionalOffers = game.promotions.promotionalOffers;
      const offer = promotionalOffers[0].promotionalOffers[0]; // Get the first offer
      const endDate = new Date(offer.endDate);

      // Remove "/home" from the productSlug if it exists
      const productSlug = game.productSlug.replace('/home', '');

      // Construct the correct store URL
      const storeUrl = `https://store.epicgames.com/en-US/p/${productSlug}`;

      return {
        title: game.title,
        image: game.keyImages.find((img) => img.type === 'Thumbnail').url,
        offerText: `Free Now - ${endDate.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}`,
        url: storeUrl,
        endDate: endDate, // Store the end date for comparison
      };
    });
  } catch (error) {
    console.error('Error fetching free games:', error);
    return [];
  }
}

// Function to send free games to a channel
async function sendFreeGames(channel) {
  const freeGames = await getFreeGames();

  if (freeGames.length === 0) {
    channel.send('No free games found at the moment.');
    return;
  }

  // Send an embed for each game with a button
  freeGames.forEach((game) => {
    const embed = new EmbedBuilder()
      .setTitle(game.title)
      .setImage(game.image)
      .setDescription(`**Offer**: ${game.offerText}`)
      .setColor('#0099ff');

    // Create a button for the game link
    const button = new ButtonBuilder()
      .setLabel('Get it here')
      .setURL(game.url)
      .setStyle(ButtonStyle.Link);

    // Add the button to an action row
    const row = new ActionRowBuilder().addComponents(button);

    // Send the embed and button
    channel.send({ embeds: [embed], components: [row] });
  });
}

// Function to check for new free games
async function checkForNewFreeGames() {
  const channel = client.channels.cache.get(channelId);
  if (!channel) {
    console.error('Channel not found!');
    return;
  }

  const freeGames = await getFreeGames();
  const now = new Date();

  // Filter out games that have already ended
  const activeGames = freeGames.filter((game) => game.endDate > now);

  if (activeGames.length > 0) {
    // Send the new free games
    await sendFreeGames(channel);
  } else {
    console.log('No active free games found.');
  }
}



// Log in to Discord
client.login(token);

// Bot ready event
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);

  // Check for new free games every hour (3600000 milliseconds)
  setInterval(checkForNewFreeGames, 3600000);

  // Initial check
  checkForNewFreeGames();
});

