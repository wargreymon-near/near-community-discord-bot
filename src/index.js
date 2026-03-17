require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { loadCommands } = require('./handlers/commandHandler');
const { loadEvents } = require('./handlers/eventHandler');
const { startPriceAlerts } = require('./services/priceAlerts');
const { startMarketplaceNotifications } = require('./services/marketplaceNotifications');

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

  client.once('ready', () => {
    console.log(`✅ Bot online as ${client.user.tag}`);
    startPriceAlerts(client);
    startMarketplaceNotifications(client);
  });

  await client.login(process.env.DISCORD_TOKEN);
})();
