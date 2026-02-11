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
  intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();

// 🔹 Cargar comandos desde carpeta /commands
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(`⚠️ El archivo ${file} no tiene estructura válida.`);
  }
}

// 🔹 Cuando el bot está listo
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

// 🔹 Manejar interacciones
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "❌ Hubo un error ejecutando este comando.",
        ephemeral: true
      });
    } else {
      await interaction.reply({
        content: "❌ Hubo un error ejecutando este comando.",
        ephemeral: true
      });
    }
  }
});

client.login(process.env.TOKEN);
