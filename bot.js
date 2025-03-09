const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
const { token, channelId, automatic, botstartup } = require('./config.json');

// Create a new Discord client
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

// Store custom embed colors for each server
const embedColors = new Map();

// Store the last sent active games to avoid duplicates
let lastSentGames = [];

// Function to fetch upcoming free games
async function getUpcomingFreeGames() {
  try {
    const response = await axios.get('https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions');
    const games = response.data.data.Catalog.searchStore.elements;

    const upcomingGames = games.filter(
      (game) => game.promotions && game.promotions.upcomingPromotionalOffers?.length > 0
    );

    return upcomingGames
      .map((game) => {
        const promotionalOffers = game.promotions.upcomingPromotionalOffers;
        const offer = promotionalOffers[0].promotionalOffers[0]; // Get the first offer
        const viewableDate = new Date(offer.startDate);

        // Get the original price
        const originalPrice = game.price?.totalPrice?.fmtPrice?.originalPrice || 'Unknown';

        // Get the pageSlug from offerMappings, fallback to productSlug
        const pageSlug = game.offerMappings?.find((mapping) => mapping.pageSlug)?.pageSlug || game.productSlug?.replace('/home', '') || null;

        // Get the offerType
        const offerType = game.offerType || null;

        return {
          title: game.title,
          description: game.description,
          viewableDate: viewableDate.toLocaleString('en-US', {
            year: 'numeric', // Include the year
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          pageSlug: pageSlug,
          offerType: offerType,
          originalPrice: originalPrice,
        };
      });
  } catch (error) {
    console.error('Error fetching upcoming free games:', error);
    return [];
  }
}

// Function to fetch currently active free games
async function getActiveFreeGames() {
  try {
    const response = await axios.get('https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions');
    const games = response.data.data.Catalog.searchStore.elements;

    const activeGames = games.filter(
      (game) => game.promotions && game.promotions.promotionalOffers?.length > 0
    );

    return activeGames
      .map((game) => {
        const promotionalOffers = game.promotions.promotionalOffers;
        const offer = promotionalOffers[0].promotionalOffers[0]; // Get the first offer
        const endDate = new Date(offer.endDate);

        // Get the original price
        const originalPrice = game.price?.totalPrice?.fmtPrice?.originalPrice || 'Unknown';

        // Get the thumbnail image
        const thumbnail = game.keyImages.find((img) => img.type === 'Thumbnail')?.url;

        // Get the pageSlug from offerMappings, fallback to productSlug
        const pageSlug = game.offerMappings?.find((mapping) => mapping.pageSlug)?.pageSlug || game.productSlug?.replace('/home', '') || null;

        // Get the offerType
        const offerType = game.offerType || null;

        return {
          title: game.title,
          description: game.description,
          endDate: endDate,
          endDateString: endDate.toLocaleString('en-US', {
            year: 'numeric', // Include the year
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          pageSlug: pageSlug,
          offerType: offerType,
          originalPrice: originalPrice,
          thumbnail: thumbnail,
        };
      });
  } catch (error) {
    console.error('Error fetching active free games:', error);
    return [];
  }
}

// Function to send active free games to the channel
async function sendActiveFreeGames() {
  const channel = client.channels.cache.get(channelId);
  if (!channel) {
    console.error('Channel not found!');
    return;
  }

  const activeGames = await getActiveFreeGames();

  if (activeGames.length === 0) {
    console.log('No active free games found.');
    lastSentGames = []; // Reset last sent games
    return;
  }

  // Check if the active games are the same as the last sent games
  const isSameGames = activeGames.every((game) =>
    lastSentGames.some((lastGame) => lastGame.title === game.title)
  );

  if (isSameGames) {
    console.log('No new active free games found.');
    return;
  }

  // Update last sent games
  lastSentGames = activeGames;

  const embed = new EmbedBuilder()
    .setTitle('Currently Free Games on Epic Games Store')
    .setColor('#0099ff') // Default color
    .setDescription('Here are the games that are currently free!')
    .setFooter({ text: 'Plexus Development | Pieter Bjorn' }); // Add footer here

  const components = [];

  activeGames.forEach((game) => {
    embed.addFields({
      name: game.title,
      value: `**Description**: ${game.description}\n**Free until**: ${game.endDateString}\n**Original Price**: ${game.originalPrice}`,
    });

    // Add a button for the game link (only if pageSlug is valid)
    if (game.pageSlug) {
      const link = game.offerType === 'BUNDLE'
        ? `https://store.epicgames.com/en-US/bundles/${game.pageSlug}`
        : `https://store.epicgames.com/en-US/p/${game.pageSlug}`;

      const button = new ButtonBuilder()
        .setLabel(`Get ${game.title} here`)
        .setURL(link)
        .setStyle(ButtonStyle.Link);

      const row = new ActionRowBuilder().addComponents(button);
      components.push(row);
    }

    // Add the thumbnail image to the embed (if available)
    if (game.thumbnail) {
      embed.setImage(game.thumbnail);
    }

    // Schedule a notification when the game's free offer ends
    const timeUntilEnd = game.endDate - Date.now();
    if (timeUntilEnd > 0) {
      setTimeout(async () => {
        const endedEmbed = new EmbedBuilder()
          .setTitle('Game Offer Has Ended')
          .setColor('#ff0000') // Red color for ended offer
          .setDescription(`The free offer for **${game.title}** has ended.`)
          .setFooter({ text: 'Plexus Development | Pieter Bjorn' }); // Add footer here

        await channel.send({ embeds: [endedEmbed] });
      }, timeUntilEnd);
    }
  });

  // Send the embed with buttons (if any)
  await channel.send({ embeds: [embed], components: components.length > 0 ? components : [] });

  // Schedule the next check based on the earliest endDate
  const earliestEndDate = activeGames.reduce((earliest, game) =>
    game.endDate < earliest ? game.endDate : earliest,
    activeGames[0].endDate
  );

  const timeUntilNextCheck = earliestEndDate - Date.now();

  if (timeUntilNextCheck > 0) {
    console.log(`Scheduling next check in ${timeUntilNextCheck / 1000} seconds.`);
    setTimeout(() => {
      sendActiveFreeGames(); // Check for new active games after the current ones end
      if (automatic) {
        sendUpcomingFreeGames(); // Send upcoming games if automatic is true
      }
    }, timeUntilNextCheck);
  }
}

// Function to send upcoming free games to the channel
async function sendUpcomingFreeGames() {
  const channel = client.channels.cache.get(channelId);
  if (!channel) {
    console.error('Channel not found!');
    return;
  }

  const upcomingGames = await getUpcomingFreeGames();

  if (upcomingGames.length === 0) {
    console.log('No upcoming free games found.');
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle('Upcoming Free Games on Epic Games Store')
    .setColor('#0099ff') // Default color
    .setDescription('Here are the games that will be free soon!')
    .setFooter({ text: 'Plexus Development | Pieter Bjorn' }); // Add footer here

  const components = [];

  upcomingGames.forEach((game) => {
    embed.addFields({
      name: game.title,
      value: `**Description**: ${game.description}\n**Available from**: ${game.viewableDate}\n**Original Price**: ${game.originalPrice}`,
    });

    // Add a button for the game link (only if pageSlug is valid)
    if (game.pageSlug) {
      const link = game.offerType === 'BUNDLE'
        ? `https://store.epicgames.com/en-US/bundles/${game.pageSlug}`
        : `https://store.epicgames.com/en-US/p/${game.pageSlug}`;

      const button = new ButtonBuilder()
        .setLabel(`Get ${game.title} here`)
        .setURL(link)
        .setStyle(ButtonStyle.Link);

      const row = new ActionRowBuilder().addComponents(button);
      components.push(row);
    }
  });

  // Send the embed with buttons (if any)
  await channel.send({ embeds: [embed], components: components.length > 0 ? components : [] });
}

// Command to show upcoming free games
client.on('messageCreate', async (message) => {
  if (message.content === '!upcoming') {
    const upcomingGames = await getUpcomingFreeGames();

    if (upcomingGames.length === 0) {
      message.channel.send('No upcoming free games found.');
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle('Upcoming Free Games on Epic Games Store')
      .setColor(getEmbedColor(message.guild.id))
      .setDescription('Here are the games that will be free soon!')
      .setFooter({ text: 'Plexus Development | Pieter Bjorn' }); // Add footer here

    const components = [];

    upcomingGames.forEach((game) => {
      embed.addFields({
        name: game.title,
        value: `**Description**: ${game.description}\n**Available from**: ${game.viewableDate}\n**Original Price**: ${game.originalPrice}`,
      });

      // Add a button for the game link (only if pageSlug is valid)
      if (game.pageSlug) {
        const link = game.offerType === 'BUNDLE'
          ? `https://store.epicgames.com/en-US/bundles/${game.pageSlug}`
          : `https://store.epicgames.com/en-US/p/${game.pageSlug}`;

        const button = new ButtonBuilder()
          .setLabel(`Get ${game.title} here`)
          .setURL(link)
          .setStyle(ButtonStyle.Link);

        const row = new ActionRowBuilder().addComponents(button);
        components.push(row);
      }
    });

    // Send the embed with buttons (if any)
    message.channel.send({ embeds: [embed], components: components.length > 0 ? components : [] });
  }
});

// Function to get embed color for a server
function getEmbedColor(guildId) {
  return embedColors.get(guildId) || '#0099ff'; // Default color
}

// Bot ready event
client.once('ready', async () => {
  // ASCII Art for "Plexus Development"
  console.log(`
    _____  _                       _____                 _                                  _   
   |  __ \\| |                     |  __ \\               | |                                | |  
   | |__) | | _____  ___   _ ___  | |  | | _____   _____| | ___  _ __  _ __ ___   ___ _ __ | |_ 
   |  ___/| |/ _ \\ \\/ / | | / __| | |  | |/ _ \\ \\ / / _ \\ |/ _ \\| '_ \\| '_ \` _ \\ / _ \\ '_ \\| __|
   | |    | |  __/>  <| |_| \\__ \\ | |__| |  __/\\ V /  __/ | (_) | |_) | | | | | |  __/ | | | |_ 
   |_|    |_|\\___/_/\\_\\\\__,_|___/ |_____/ \\___| \\_/ \\___|_|\\___/| .__/|_| |_| |_|\\___|_| |_|\\__|
                                                                | |                             
                                                                |_|                             
  `);

  // Bot description
  console.log(`
  Welcome to the Epic Games Free Games Bot!
  This bot automatically checks for and announces:
  - Currently free games on the Epic Games Store.
  - Upcoming free games on the Epic Games Store.
  Use the command !upcoming to see upcoming free games.
  `);

  // Log configuration details
  console.log(`
  Configuration Details:
  - token: Your Discord Bot Token (Required for the bot to log in)
  - channelId: The ID of the channel where the bot will send messages (Required)
  - automatic: Whether the bot should automatically send upcoming games after current ones end (Optional, default: true)
  - botstartup: Whether the bot should send active and upcoming games on startup (Optional, default: true)
  `);

  console.log(`Logged in as ${client.user.tag}`);

  // Send active free games and upcoming free games immediately when the bot starts
  if (botstartup) {
    sendActiveFreeGames();
    sendUpcomingFreeGames();
  }
});

// Log in to Discord
client.login(token);
