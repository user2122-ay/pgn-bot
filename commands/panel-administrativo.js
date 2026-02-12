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
    .setName("panel-administrativo")
    .setDescription("Panel de atención administrativa PGN"),

  /* ============================= */
  /* 🔹 ENVIAR PANEL */
  /* ============================= */

  async execute(interaction) {

    const embed = new EmbedBuilder()
      .setTitle("🏛️ Panel Administrativo - PGN")
      .setDescription(
        "**Ministerio Público - Área Administrativa**\n\n" +
        "Seleccione el trámite que desea realizar:"
      )
      .setColor(0x34495e)
      .setFooter({ text: "PGN - Sistema Administrativo Oficial" })
      .setTimestamp();

    const menu = new StringSelectMenuBuilder()
      .setCustomId("panel_admin_select")
      .setPlaceholder("Seleccione una opción")
      .addOptions([
        {
          label: "Denuncia administrativa",
          description: "Reportar irregularidad administrativa",
          value: "denuncia_admin",
          emoji: "📄"
        },
        {
          label: "Apelar sanción administrativa",
          description: "Solicitar revisión de sanción",
          value: "apelar_sancion",
          emoji: "⚖️"
        },
        {
          label: "Asesoría legal",
          description: "Solicitar orientación jurídica",
          value: "asesoria_legal",
          emoji: "📚"
        },
        {
          label: "Asistencia administrativa",
          description: "Solicitar apoyo administrativo",
          value: "asistencia_admin",
          emoji: "🗂️"
        },
        {
          label: "Denuncia inconstitucional",
          description: "Reportar acto inconstitucional",
          value: "denuncia_inconstitucional",
          emoji: "🏛️"
        }
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.reply({
      content: "📌 Panel administrativo enviado correctamente.",
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

    if (interaction.customId !== "panel_admin_select") return;

    const tipo = interaction.values[0];

    await interaction.deferReply({ flags: 64 });

    const canal = await interaction.guild.channels.create({
      name: `admin-${interaction.user.username}`,
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

    let contenido = "Explique detalladamente su solicitud.";

    if (tipo === "denuncia_admin") {
      contenido = `📄 **Denuncia Administrativa**

Nombre:
Cargo:
Entidad involucrada:

Descripción de los hechos:

Adjunte pruebas si posee.`;
    }

    if (tipo === "apelar_sancion") {
      contenido = `⚖️ **Apelación de Sanción Administrativa**

Número de expediente:
Motivo de apelación:

Argumentos de defensa:`;
    }

    if (tipo === "asesoria_legal") {
      contenido = `📚 **Solicitud de Asesoría Legal**

Explique su situación jurídica para recibir orientación.`;
    }

    if (tipo === "asistencia_admin") {
      contenido = `🗂️ **Solicitud de Asistencia Administrativa**

Indique el trámite o gestión requerida.`;
    }

    if (tipo === "denuncia_inconstitucional") {
      contenido = `🏛️ **Denuncia de Inconstitucionalidad**

Norma o acto cuestionado:
Fundamento constitucional:

Explique detalladamente.`;
    }

    const embedTicket = new EmbedBuilder()
      .setTitle("📂 Ticket Administrativo Abierto")
      .setDescription(
        `👤 Usuario: ${interaction.user}\n` +
        `📌 Tipo: ${tipo}\n\n` +
        "Espere a que un fiscal atienda su caso."
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
      content: "✅ Su ticket administrativo ha sido creado correctamente."
    });
  }
};
