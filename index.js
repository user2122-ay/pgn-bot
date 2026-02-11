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

    await rest.put(
      Routes.applicationCommands(client.user.id),
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

  /* ---------- Select Menu (Panel PGN) ---------- */
  if (interaction.isStringSelectMenu()) {
    if (interaction.customId === "pgn_panel_select") {

      const command = client.commands.get("panel-pgn");
      if (!command || !command.select) return;

      try {
        await command.select(interaction);
      } catch (error) {
        console.error("❌ Error en select menu:", error);
        await interaction.reply({
          content: "❌ Error procesando la solicitud.",
          flags: 64
        });
      }
    }
  }

  /* ---------- BOTONES (Reclamar / Cerrar Ticket) ---------- */
  if (interaction.isButton()) {

    const command = client.commands.get("panel-pgn");
    if (!command || !command.button) return;

    try {
      await command.button(interaction);
    } catch (error) {
      console.error("❌ Error en botón:", error);
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
