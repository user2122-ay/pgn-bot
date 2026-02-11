const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ChannelType,
  PermissionsBitField
} = require("discord.js");

const ROL_FISCAL = "1399106688904073256";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("panel-pgn")
    .setDescription("Enviar panel oficial de atención PGN"),

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
      ephemeral: true
    });

    await interaction.channel.send({
      embeds: [embed],
      components: [row]
    });
  },

  async select(interaction) {

    const tipo = interaction.values[0];

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

    let contenido = "";

    if (tipo === "denuncia") {
      contenido = `## 📄 Plantilla de Denuncia

### 👤 Datos del denunciante
Nombre:
Cédula:
Contacto:

### 🕵️ Datos del denunciado
Nombre:
Cargo:

### 📖 Descripción de los hechos
Explique detalladamente lo ocurrido.

### 📂 Pruebas
Adjunte evidencias aquí.`;
    }

    if (tipo === "asistencia") {
      contenido = `⚖️ Solicitud de Asistencia Fiscal

Explique su situación para recibir orientación.`;
    }

    if (tipo === "queja") {
      contenido = `🛡️ Queja contra funcionario

Indique nombre y describa los hechos.`;
    }

    if (tipo === "seguimiento") {
      contenido = `📑 Seguimiento de caso

Indique número de expediente o datos relevantes.`;
    }

    const embedTicket = new EmbedBuilder()
      .setTitle("📂 Ticket PGN Abierto")
      .setDescription(
        `👤 Usuario: ${interaction.user}\n` +
        `📌 Tipo: ${tipo}`
      )
      .setColor(0x2c3e50)
      .setTimestamp();

    await canal.send({
      content: `<@&${ROL_FISCAL}>`,
      embeds: [embedTicket]
    });

    await canal.send(contenido);

    await interaction.reply({
      content: "✅ Tu ticket ha sido creado correctamente.",
      ephemeral: true
    });
  }
};
