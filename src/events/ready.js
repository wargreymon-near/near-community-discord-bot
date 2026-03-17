const { startPriceAlerts } = require('../services/priceAlerts');
const { startMarketplaceNotifications } = require('../services/marketplaceNotifications');

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`✅ Bot online as ${client.user.tag}`);
    startPriceAlerts(client);
    startMarketplaceNotifications(client);
  },
};
