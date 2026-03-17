const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const axios = require('axios');

const verifiedUsers = new Map(); // discordId -> nearAccount

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verify')
    .setDescription('Verify your NEAR wallet ownership')
    .addSubcommand(sub =>
      sub.setName('wallet')
        .setDescription('Link your NEAR wallet to your Discord account')
        .addStringOption(opt =>
          opt.setName('account').setDescription('Your NEAR account (e.g. alice.near)').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('check')
        .setDescription('Check verification status of a user')
        .addUserOption(opt =>
          opt.setName('user').setDescription('User to check (defaults to you)'))),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'wallet') {
      const account = interaction.options.getString('account');
      await interaction.deferReply({ ephemeral: true });

      try {
        // Validate account exists on NEAR
        const { data } = await axios.post('https://rpc.mainnet.near.org', {
          jsonrpc: '2.0',
          id: 'dontcare',
          method: 'query',
          params: {
            request_type: 'view_account',
            finality: 'final',
            account_id: account,
          },
        });

        if (data.error) {
          return interaction.editReply(`❌ Account **${account}** not found on NEAR mainnet.`);
        }

        if (!data.result) {
          return interaction.editReply('❌ Unexpected response from NEAR RPC. Please try again.');
        }

        verifiedUsers.set(interaction.user.id, account);

        // Assign verified role if exists
        const role = interaction.guild.roles.cache.find(r => r.name === 'NEAR Verified');
        if (role) {
          await interaction.member.roles.add(role).catch(err => {
            console.error('Failed to assign NEAR Verified role:', err.message);
          });
        }

        let balance = '0';
        try {
          balance = (BigInt(data.result.amount ?? '0') / BigInt(1e24)).toString();
        } catch {
          balance = 'N/A';
        }

        const embed = new EmbedBuilder()
          .setTitle('✅ Wallet Verified')
          .setColor(0x00ff88)
          .addFields(
            { name: 'Discord', value: `<@${interaction.user.id}>`, inline: true },
            { name: 'NEAR Account', value: account, inline: true },
            { name: 'Balance', value: `${balance} NEAR`, inline: true },
          )
          .setTimestamp()
          .setFooter({ text: 'NEAR Community Bot' });

        await interaction.editReply({ embeds: [embed] });

      } catch (err) {
        await interaction.editReply('❌ Failed to verify wallet. Please try again.');
      }

    } else if (sub === 'check') {
      const target = interaction.options.getUser('user') ?? interaction.user;
      const nearAccount = verifiedUsers.get(target.id);

      if (!nearAccount) {
        return interaction.reply({
          content: `❌ **${target.username}** has not verified a NEAR wallet yet.`,
          ephemeral: true,
        });
      }

      const embed = new EmbedBuilder()
        .setTitle('🔍 Verification Status')
        .setColor(0x00c2ff)
        .addFields(
          { name: 'Discord', value: `<@${target.id}>`, inline: true },
          { name: 'NEAR Account', value: nearAccount, inline: true },
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
