const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { subscribe, unsubscribe } = require('../services/marketplaceNotifications');
const { getMarketplaceActivity } = require('../services/near');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('marketplace')
    .setDescription('NEAR NFT marketplace tools')
    .addSubcommand(sub =>
      sub.setName('recent').setDescription('Show recent NFT activity on Paras'))
    .addSubcommand(sub =>
      sub.setName('watch')
        .setDescription('Watch a channel for marketplace notifications')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addChannelOption(opt =>
          opt.setName('channel').setDescription('Channel to send notifications').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('unwatch')
        .setDescription('Stop marketplace notifications')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'recent') {
      await interaction.deferReply();
      try {
        const activities = await getMarketplaceActivity();
        if (!activities.length) {
          return interaction.editReply('No recent activity found.');
        }

        const embed = new EmbedBuilder()
          .setTitle('🏪 Recent NEAR Marketplace Activity')
          .setColor(0x9b59b6)
          .setDescription(
            activities.slice(0, 5).map(a => {
              const isSale = a.type === 'resolve_purchase';
              let priceStr = '';
              if (a.price) {
                try {
                  priceStr = ` — ${(BigInt(a.price) / BigInt(1e24)).toString()} NEAR`;
                } catch { /* ignore invalid price */ }
              }
              return `${isSale ? '💰' : '🔄'} **${a.token_id ?? 'Unknown'}** — ${a.contract_id ?? ''}${priceStr}`;
            }).join('\n')
          )
          .setTimestamp()
          .setFooter({ text: 'NEAR Community Bot • Paras.id' });

        await interaction.editReply({ embeds: [embed] });
      } catch {
        await interaction.editReply('❌ Failed to fetch marketplace activity.');
      }

    } else if (sub === 'watch') {
      const channel = interaction.options.getChannel('channel');
      subscribe(interaction.guildId, channel.id);
      await interaction.reply({
        content: `✅ Marketplace notifications will be sent to <#${channel.id}>`,
        ephemeral: true,
      });

    } else if (sub === 'unwatch') {
      unsubscribe(interaction.guildId);
      await interaction.reply({ content: '🔕 Marketplace notifications stopped.', ephemeral: true });
    }
  },
};
