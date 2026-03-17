const cron = require('node-cron');
const { EmbedBuilder } = require('discord.js');
const { getNearPrice } = require('./near');

const alertSubscriptions = new Map(); // guildId -> { channelId, threshold }
let lastPrice = null;
let priceTask = null;

function startPriceAlerts(client) {
  // Check price every 5 minutes
  priceTask = cron.schedule('*/5 * * * *', async () => {
    try {
      const price = await getNearPrice();
      const current = price.usd;
      const change24h = price.usd_24h_change ?? 0;

      for (const [, sub] of alertSubscriptions.entries()) {
        const channel = client.channels.cache.get(sub.channelId);
        if (!channel) continue;

        const shouldAlert =
          !lastPrice ||
          Math.abs(current - lastPrice) / lastPrice * 100 >= sub.threshold;

        if (shouldAlert) {
          const isPositive = change24h >= 0;
          const embed = new EmbedBuilder()
            .setTitle('🔔 NEAR Price Alert')
            .setColor(isPositive ? 0x00ff88 : 0xff4444)
            .addFields(
              { name: 'Price (USD)', value: `$${current.toFixed(4)}`, inline: true },
              { name: '24h Change', value: `${isPositive ? '▲' : '▼'} ${change24h.toFixed(2)}%`, inline: true },
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

function stopPriceAlerts() {
  priceTask?.stop();
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

module.exports = { startPriceAlerts, stopPriceAlerts, subscribe, unsubscribe, getSubscription };
