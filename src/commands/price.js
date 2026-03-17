const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getNearPrice } = require('../services/near');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('price')
    .setDescription('Get the current NEAR token price'),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const price = await getNearPrice();
      const change = price.usd_24h_change?.toFixed(2) ?? '0';
      const isPositive = parseFloat(change) >= 0;

      const embed = new EmbedBuilder()
        .setTitle('💎 NEAR Token Price')
        .setColor(isPositive ? 0x00ff88 : 0xff4444)
        .setThumbnail('https://cryptologos.cc/logos/near-protocol-near-logo.png')
        .addFields(
          { name: '💵 USD', value: `$${price.usd.toFixed(4)}`, inline: true },
          { name: '₿ BTC', value: `${price.btc.toFixed(8)}`, inline: true },
          { name: 'Ξ ETH', value: `${price.eth.toFixed(6)}`, inline: true },
          { name: '📈 24h Change', value: `${isPositive ? '▲' : '▼'} ${change}%`, inline: true },
        )
        .setTimestamp()
        .setFooter({ text: 'NEAR Community Bot • Data: CoinGecko' });

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      await interaction.editReply('❌ Failed to fetch price. Try again later.');
    }
  },
};
