const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getNearStats, getNearPrice } = require('../services/near');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Show live NEAR network statistics'),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const [stats, price] = await Promise.all([getNearStats(), getNearPrice()]);

      const embed = new EmbedBuilder()
        .setTitle('📊 NEAR Network Stats')
        .setColor(0x00c2ff)
        .setThumbnail('https://cryptologos.cc/logos/near-protocol-near-logo.png')
        .addFields(
          { name: '💵 Price', value: `$${price.usd.toFixed(4)}`, inline: true },
          { name: '📈 24h Change', value: `${price.usd_24h_change?.toFixed(2) ?? 'N/A'}%`, inline: true },
          { name: '🔗 Nodes', value: `${stats.nodes_online ?? 'N/A'}`, inline: true },
          { name: '⚡ TPS', value: `${stats.tps ?? 'N/A'}`, inline: true },
          { name: '🏦 Market Cap', value: stats.market_cap ? `$${Number(stats.market_cap).toLocaleString()}` : 'N/A', inline: true },
          { name: '📦 Blocks', value: `${Number(stats.block_height ?? 0).toLocaleString()}`, inline: true },
        )
        .setTimestamp()
        .setFooter({ text: 'NEAR Community Bot • Data: NEARBlocks' });

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      await interaction.editReply('❌ Failed to fetch network stats.');
    }
  },
};
