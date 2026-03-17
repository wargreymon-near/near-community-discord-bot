const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getGasPrice, getNearStats } = require('../services/near');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('gas')
    .setDescription('Compare NEAR gas fees vs other blockchains'),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const [gasData, stats] = await Promise.all([getGasPrice(), getNearStats()]);

      // Approximate gas costs for comparison (USD)
      const comparisons = [
        { chain: 'NEAR', tx: '~$0.0001', finality: '~1-2s', tps: gasData.tps ?? stats.tps ?? 'N/A' },
        { chain: 'Ethereum', tx: '~$1-20', finality: '~15s', tps: '~15' },
        { chain: 'Solana', tx: '~$0.00025', finality: '~0.4s', tps: '~2000' },
        { chain: 'Polygon', tx: '~$0.01', finality: '~2s', tps: '~7000' },
      ];

      const embed = new EmbedBuilder()
        .setTitle('⛽ Gas Fee Comparison')
        .setColor(0x00c2ff)
        .setDescription('Current gas prices across major blockchains')
        .addFields(
          comparisons.map(c => ({
            name: c.chain === 'NEAR' ? `✅ ${c.chain}` : c.chain,
            value: `💸 Tx Cost: ${c.tx}\n⚡ Finality: ${c.finality}\n🚀 TPS: ${c.tps}`,
            inline: true,
          }))
        )
        .addFields({
          name: '📊 NEAR Live Gas Price',
          value: `${gasData.gasPrice} yoctoNEAR/gas unit\nAvg Block: ${gasData.avgBlockTime}s`,
        })
        .setTimestamp()
        .setFooter({ text: 'NEAR Community Bot • Data: NEARBlocks' });

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      await interaction.editReply('❌ Failed to fetch gas data. Try again later.');
    }
  },
};
