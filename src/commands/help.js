const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show all available NEAR bot commands'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('🤖 NEAR Community Bot — Commands')
      .setColor(0x00c2ff)
      .setThumbnail('https://cryptologos.cc/logos/near-protocol-near-logo.png')
      .addFields(
        { name: '💎 /price', value: 'Get current NEAR token price (USD, BTC, ETH)' },
        { name: '⛽ /gas', value: 'Compare NEAR gas fees vs Ethereum, Solana, Polygon' },
        { name: '📊 /stats', value: 'Live NEAR network statistics' },
        { name: '🔔 /alert set', value: 'Set price alert channel and % threshold' },
        { name: '🔕 /alert remove', value: 'Remove price alerts' },
        { name: '📋 /alert status', value: 'View current alert configuration' },
        { name: '🏪 /marketplace recent', value: 'Show recent NFT sales on Paras' },
        { name: '👁 /marketplace watch', value: 'Watch a channel for live NFT activity' },
        { name: '🔕 /marketplace unwatch', value: 'Stop marketplace notifications' },
        { name: '✅ /verify wallet', value: 'Link your NEAR wallet to your Discord account' },
        { name: '🔍 /verify check', value: 'Check a user\'s NEAR verification status' },
      )
      .setFooter({ text: 'NEAR Community Bot • market.near.ai' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
