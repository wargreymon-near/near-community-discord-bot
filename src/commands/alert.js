const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { subscribe, unsubscribe, getSubscription } = require('../services/priceAlerts');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('alert')
    .setDescription('Manage NEAR price alerts for this server')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(sub =>
      sub.setName('set')
        .setDescription('Set price alert channel and threshold')
        .addChannelOption(opt =>
          opt.setName('channel').setDescription('Channel to send alerts').setRequired(true))
        .addIntegerOption(opt =>
          opt.setName('threshold').setDescription('% change to trigger alert (default: 5)').setMinValue(1).setMaxValue(50)))
    .addSubcommand(sub =>
      sub.setName('remove').setDescription('Remove price alerts for this server'))
    .addSubcommand(sub =>
      sub.setName('status').setDescription('Show current alert configuration')),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'set') {
      const channel = interaction.options.getChannel('channel');
      const threshold = interaction.options.getInteger('threshold') ?? 5;
      subscribe(interaction.guildId, channel.id, threshold);

      const embed = new EmbedBuilder()
        .setTitle('✅ Price Alert Set')
        .setColor(0x00ff88)
        .addFields(
          { name: 'Channel', value: `<#${channel.id}>`, inline: true },
          { name: 'Threshold', value: `${threshold}%`, inline: true },
        )
        .setDescription('You will receive NEAR price alerts when the price changes by the specified threshold.')
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

    } else if (sub === 'remove') {
      unsubscribe(interaction.guildId);
      await interaction.reply({ content: '🔕 Price alerts removed for this server.', ephemeral: true });

    } else if (sub === 'status') {
      const sub = getSubscription(interaction.guildId);
      if (!sub) {
        return interaction.reply({ content: '❌ No price alerts configured. Use `/alert set` to set one.', ephemeral: true });
      }
      const embed = new EmbedBuilder()
        .setTitle('🔔 Alert Status')
        .setColor(0x00c2ff)
        .addFields(
          { name: 'Channel', value: `<#${sub.channelId}>`, inline: true },
          { name: 'Threshold', value: `${sub.threshold}%`, inline: true },
        )
        .setTimestamp();
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
