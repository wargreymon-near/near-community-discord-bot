require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { loadCommands } = require('./handlers/commandHandler');
const { loadEvents } = require('./handlers/eventHandler');
const { stopPriceAlerts } = require('./services/priceAlerts');
const { stopMarketplaceNotifications } = require('./services/marketplaceNotifications');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new Collection();

(async () => {
  await loadCommands(client);
  await loadEvents(client);
  await client.login(process.env.DISCORD_TOKEN);
})();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down...');
  stopPriceAlerts();
  stopMarketplaceNotifications();
  client.destroy();
  process.exit(0);
});
