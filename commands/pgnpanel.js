const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  PermissionFlagsBits,
  ChannelType
} = require("discord.js");

const ROL_FISCAL = "1399106688904073256";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pgnpanel")
    .setDescription("Panel de atención PGN"),

  async execute(interaction) {

    const embed = new EmbedBuilder()
      .setTitle("🏛️ Procuraduría General de la Nación")
      .setDescription(
        "Seleccione el tipo de trámite que desea realizar:\n\n" +
        "📩 **Denunciar** → Presentar una denuncia formal.\n" +
        "⚖️ **Asistencia Fiscal** → Solicitar orientación o apoyo fiscal."
      )
      .setColor(0x2c3e50)
      .setTimestamp();

    const menu = new StringSelectMenuBuilder()
      .setCustomId("pgn_select")
      .setPlaceholder("Seleccione una opción")
      .addOptions([
        {
          label: "Denunciar",
          description: "Presentar una denuncia formal",
          value: "denuncia",
          emoji: "📩"
        },
        {
          label: "Asistencia Fiscal",
          description: "Solicitar orientación fiscal",
          value: "asistencia",
          emoji: "⚖️"
        }
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.reply({ embeds: [embed], components: [row] });
  },

  // 🔥 Manejar selección
  async selectMenu(interaction) {
    if (interaction.customId !== "pgn_select") return;

    const tipo = interaction.values[0];

    const nombreCanal = `ticket-${interaction.user.username}`.toLowerCase();

    const canal = await interaction.guild.channels.create({
      name: nombreCanal,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: [PermissionFlagsBits.ViewChannel]
        },
        {
          id: interaction.user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory
          ]
        },
        {
          id: ROL_FISCAL,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory
          ]
        }
      ]
    });

    let descripcionTicket = "";

    if (tipo === "denuncia") {
      descripcionTicket =
        "📩 **Tipo:** Denuncia Formal\n\n" +
        "Por favor describa detalladamente los hechos.\n" +
        "Adjunte pruebas si las posee.\n\n" +
        "Un fiscal atenderá su caso pronto.";
    }

    if (tipo === "asistencia") {
      descripcionTicket =
        "⚖️ **Tipo:** Asistencia Fiscal\n\n" +
        "Explique su situación o consulta.\n" +
        "Un fiscal le brindará orientación lo antes posible.";
    }

    const embedTicket = new EmbedBuilder()
      .setTitle("🏛️ Ticket PGN Abierto")
      .setDescription(descripcionTicket)
      .setColor(0x34495e)
      .setFooter({ text: `Usuario: ${interaction.user.tag}` })
      .setTimestamp();

    await canal.send({
      content: `<@${interaction.user.id}> <@&${ROL_FISCAL}>`,
      embeds: [embedTicket]
    });

    await interaction.reply({
      content: `✅ Tu ticket fue creado: ${canal}`,
      ephemeral: true
    });
  }
};
