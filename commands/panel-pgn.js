const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionsBitField
} = require("discord.js");

const ROL_FISCAL = "1399106688904073256";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("panel-pgn")
    .setDescription("Enviar panel oficial de atención PGN"),

  /* ============================= */
  /* 🔹 COMANDO PRINCIPAL */
  /* ============================= */

  async execute(interaction) {

    const embed = new EmbedBuilder()
      .setTitle("⚖️ Procuraduría General de la Nación")
      .setDescription(
        "🏛️ **Ministerio Público de la República de Panamá**\n\n" +
        "Bienvenido al sistema oficial de atención ciudadana.\n\n" +
        "Seleccione el tipo de trámite que desea realizar:"
      )
      .setColor(0x1f2a44)
      .setFooter({ text: "PGN - Sistema Oficial" })
      .setTimestamp();

    const menu = new StringSelectMenuBuilder()
      .setCustomId("pgn_panel_select")
      .setPlaceholder("Seleccione una opción")
      .addOptions([
        {
          label: "Denuncia",
          description: "Presentar una denuncia formal",
          value: "denuncia",
          emoji: "📄"
        },
        {
          label: "Asistencia Fiscal",
          description: "Solicitar orientación legal",
          value: "asistencia",
          emoji: "⚖️"
        },
        {
          label: "Queja contra funcionario",
          description: "Reportar conducta indebida",
          value: "queja",
          emoji: "🛡️"
        },
        {
          label: "Seguimiento de caso",
          description: "Consultar estado de proceso",
          value: "seguimiento",
          emoji: "📑"
        }
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.reply({
      content: "📌 Panel enviado correctamente.",
      flags: 64
    });

    await interaction.channel.send({
      embeds: [embed],
      components: [row]
    });
  },

  /* ============================= */
  /* 🔹 CREAR TICKET */
  /* ============================= */

  async select(interaction) {

    const tipo = interaction.values[0];

    await interaction.deferReply({ flags: 64 });

    const canal = await interaction.guild.channels.create({
      name: `pgn-${interaction.user.username}`,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel]
        },
        {
          id: interaction.user.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages
          ]
        },
        {
          id: ROL_FISCAL,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages
          ]
        }
      ]
    });

    let contenido = "Explique su solicitud.";

    if (tipo === "denuncia") {
      contenido = `## 📄 Plantilla de Denuncia

Nombre:
Cédula:
Contacto:

Descripción de los hechos:

Pruebas:`;
    }

    if (tipo === "asistencia") {
      contenido = `⚖️ Solicitud de Asistencia Fiscal\n\nExplique su situación.`;
    }

    if (tipo === "queja") {
      contenido = `🛡️ Queja contra funcionario\n\nDescriba los hechos.`;
    }

    if (tipo === "seguimiento") {
      contenido = `📑 Seguimiento de caso\n\nIndique número de expediente.`;
    }

    const embedTicket = new EmbedBuilder()
      .setTitle("📂 Ticket PGN Abierto")
      .setDescription(
        `👤 Usuario: ${interaction.user}\n` +
        `📌 Tipo: ${tipo}\n\n` +
        "Use los botones para gestionar el ticket."
      )
      .setColor(0x2c3e50)
      .setTimestamp();

    const botones = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("reclamar_ticket")
        .setLabel("🔎 Reclamar Ticket")
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId("cerrar_ticket")
        .setLabel("🔒 Cerrar Ticket")
        .setStyle(ButtonStyle.Danger)
    );

    await canal.send({
      content: `<@&${ROL_FISCAL}>`,
      embeds: [embedTicket],
      components: [botones]
    });

    await canal.send(contenido);

    await interaction.editReply({
      content: "✅ Tu ticket ha sido creado correctamente."
    });
  },

  /* ============================= */
  /* 🔹 BOTONES */
  /* ============================= */

  async button(interaction) {

    const canal = interaction.channel;

    /* 🔎 RECLAMAR TICKET */
    if (interaction.customId === "reclamar_ticket") {

      if (!interaction.member.roles.cache.has(ROL_FISCAL)) {
        return interaction.reply({
          content: "⛔ Solo un fiscal puede reclamar este ticket.",
          flags: 64
        });
      }

      // Quitar acceso al rol fiscal general
      await canal.permissionOverwrites.edit(ROL_FISCAL, {
        ViewChannel: false
      });

      // Asegurar acceso al fiscal que reclamó
      await canal.permissionOverwrites.edit(interaction.user.id, {
        ViewChannel: true,
        SendMessages: true
      });

      await interaction.reply({
        content: `✅ Ticket reclamado por ${interaction.user}.`,
        flags: 64
      });

      await canal.send(
        `👨‍⚖️ Este ticket ahora está siendo gestionado por ${interaction.user}.`
      );
    }

    /* 🔒 CERRAR TICKET */
    if (interaction.customId === "cerrar_ticket") {

      if (!interaction.member.roles.cache.has(ROL_FISCAL)) {
        return interaction.reply({
          content: "⛔ Solo un fiscal puede cerrar este ticket.",
          flags: 64
        });
      }

      await interaction.reply({
        content: "🔒 Cerrando ticket en 5 segundos...",
        flags: 64
      });

      setTimeout(() => {
        canal.delete().catch(() => {});
      }, 5000);
    }
  }
};
