const cron = require('node-cron');
const { EmbedBuilder } = require('discord.js');
const { getNearPrice } = require('./near');

const alertSubscriptions = new Map(); // guildId -> { channelId, threshold }
let lastPrice = null;

function startPriceAlerts(client) {
  // Check price every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      const price = await getNearPrice();
      const current = price.usd;

      for (const [guildId, sub] of alertSubscriptions.entries()) {
        const channel = client.channels.cache.get(sub.channelId);
        if (!channel) continue;

        const change = price.usd_24h_change?.toFixed(2);
        const shouldAlert =
          !lastPrice ||
          Math.abs(current - lastPrice) / lastPrice >= (sub.threshold / 100);

        if (shouldAlert) {
          const embed = new EmbedBuilder()
            .setTitle('🔔 NEAR Price Alert')
            .setColor(change >= 0 ? 0x00ff88 : 0xff4444)
            .addFields(
              { name: 'Price (USD)', value: `$${current.toFixed(4)}`, inline: true },
              { name: '24h Change', value: `${change >= 0 ? '▲' : '▼'} ${change}%`, inline: true },
              { name: 'vs BTC', value: `${price.btc.toFixed(8)} BTC`, inline: true },
            )
            .setTimestamp()
            .setFooter({ text: 'NEAR Community Bot • Powered by CoinGecko' });

          await channel.send({ embeds: [embed] });
        }
      }

      lastPrice = current;
    } catch (err) {
      console.error('Price alert error:', err.message);
    }
  });

  console.log('⏰ Price alert scheduler started');
}

function subscribe(guildId, channelId, threshold = 5) {
  alertSubscriptions.set(guildId, { channelId, threshold });
}

function unsubscribe(guildId) {
  alertSubscriptions.delete(guildId);
}

function getSubscription(guildId) {
  return alertSubscriptions.get(guildId);
}

module.exports = { startPriceAlerts, subscribe, unsubscribe, getSubscription };
