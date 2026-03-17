const cron = require('node-cron');
const { EmbedBuilder } = require('discord.js');
const { getMarketplaceActivity } = require('./near');

const marketSubscriptions = new Map(); // guildId -> channelId
const seenActivities = new Set();
let marketTask = null;

function parsePriceToNear(priceStr) {
  try {
    return (BigInt(priceStr) / BigInt(1e24)).toString();
  } catch {
    return null;
  }
}

function startMarketplaceNotifications(client) {
  // Poll marketplace every 2 minutes
  marketTask = cron.schedule('*/2 * * * *', async () => {
    try {
      const activities = await getMarketplaceActivity();

      for (const [, channelId] of marketSubscriptions.entries()) {
        const channel = client.channels.cache.get(channelId);
        if (!channel) continue;

        for (const activity of activities) {
          const id = activity._id ?? activity.receipt_id;
          if (!id || seenActivities.has(id)) continue;
          seenActivities.add(id);

          const isSale = activity.type === 'resolve_purchase';
          const embed = new EmbedBuilder()
            .setTitle(isSale ? '💰 NFT Sold on Paras' : '🔄 NFT Transfer')
            .setColor(isSale ? 0xffd700 : 0x9b59b6)
            .addFields(
              { name: 'Token', value: activity.token_id ?? 'Unknown', inline: true },
              { name: 'Collection', value: activity.contract_id ?? 'Unknown', inline: true },
            )
            .setTimestamp(new Date(activity.block_timestamp_utc ?? Date.now()))
            .setFooter({ text: 'NEAR Community Bot • Paras.id' });

          if (isSale && activity.price) {
            const nearPrice = parsePriceToNear(activity.price);
            if (nearPrice) embed.addFields({ name: 'Price', value: `${nearPrice} NEAR`, inline: true });
          }

          if (activity.media) embed.setThumbnail(activity.media);

          await channel.send({ embeds: [embed] });
        }
      }

      // Keep seen set bounded — remove oldest 500 entries
      if (seenActivities.size > 1000) {
        let count = 0;
        for (const id of seenActivities) {
          seenActivities.delete(id);
          if (++count >= 500) break;
        }
      }
    } catch (err) {
      console.error('Marketplace notification error:', err.message);
    }
  });

  console.log('🏪 Marketplace notification scheduler started');
}

function stopMarketplaceNotifications() {
  marketTask?.stop();
}

function subscribe(guildId, channelId) {
  marketSubscriptions.set(guildId, channelId);
}

function unsubscribe(guildId) {
  marketSubscriptions.delete(guildId);
}

module.exports = { startMarketplaceNotifications, stopMarketplaceNotifications, subscribe, unsubscribe };
