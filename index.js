require("dotenv").config();
const fs = require("fs");
const {
  Client,
  Collection,
  GatewayIntentBits,
  REST,
  Routes
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

client.commands = new Collection();

/* ============================= */
/* 🔹 CARGAR COMANDOS /commands */
/* ============================= */

const commandFiles = fs
  .readdirSync("./commands")
  .filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);

  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(`⚠️ El archivo ${file} no tiene estructura válida.`);
  }
}

/* ============================= */
/* 🔹 BOT LISTO */
/* ============================= */

client.once("ready", async () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);

  const commands = client.commands.map(cmd => cmd.data.toJSON());
  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

  try {
    console.log("🔄 Registrando comandos slash...");

    // ✅ REGISTRO INSTANTÁNEO EN TU SERVIDOR
    await rest.put(
      Routes.applicationGuildCommands(
        client.user.id,
        "1392713967926906972"
      ),
      { body: commands }
    );

    console.log("✅ Comandos slash actualizados correctamente.");
  } catch (error) {
    console.error("❌ Error registrando comandos:", error);
  }
});

/* ============================= */
/* 🔹 INTERACCIONES */
/* ============================= */

client.on("interactionCreate", async interaction => {

  /* ---------- Slash Commands ---------- */
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);

      const errorMessage = {
        content: "❌ Hubo un error ejecutando este comando.",
        flags: 64
      };

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errorMessage);
      } else {
        await interaction.reply(errorMessage);
      }
    }
  }

  /* ---------- SELECT MENUS ---------- */
  if (interaction.isStringSelectMenu()) {

    // Panel PGN
    if (interaction.customId === "pgn_panel_select") {
      const command = client.commands.get("panel-pgn");
      if (!command || !command.select) return;
      return command.select(interaction);
    }

    // Panel Administrativo
    if (interaction.customId === "panel_admin_select") {
      const command = client.commands.get("panel-administrativo");
      if (!command || !command.select) return;
      return command.select(interaction);
    }
  }

  /* ---------- BOTONES (Reclamar / Cerrar) ---------- */
  if (interaction.isButton()) {

    // Primero intenta con panel-pgn
    let command = client.commands.get("panel-pgn");

    if (command && command.button) {
      try {
        return command.button(interaction);
      } catch (error) {
        console.error("❌ Error en botón:", error);
      }
    }

    // Luego intenta con panel-administrativo
    command = client.commands.get("panel-administrativo");

    if (command && command.button) {
      try {
        return command.button(interaction);
      } catch (error) {
        console.error("❌ Error en botón:", error);
      }
    }

    // Error general
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: "❌ Error procesando el botón.",
        flags: 64
      });
    }
  }

});

/* ============================= */
/* 🔹 LOGIN */
/* ============================= */

client.login(process.env.TOKEN);
