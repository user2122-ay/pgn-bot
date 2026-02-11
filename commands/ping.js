const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Verifica si el bot está funcionando"),

  async execute(interaction) {
    await interaction.reply("🏓 Pong! El bot PGN está funcionando correctamente.");
  }
};
