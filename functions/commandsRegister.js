import { readdirSync } from "node:fs";
import { join } from "node:path";
import { REST, Routes } from "discord.js";
import { logger } from "../functions/logger";

const BOT_TOKEN = process.env.BOT_TOKEN;
const BOT_ID = process.env.BOT_ID;

const commands = [];
const foldersPath = join(__dirname, "../commands");
const commandFolders = readdirSync(foldersPath);

let client;

for (const folder of commandFolders) {
  const commandsPath = join(foldersPath, folder);
  const commandFiles = readdirSync(commandsPath).filter((file) =>
    file.endsWith(".js")
  );

  for (const file of commandFiles) {
    const filePath = join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command) {
      commands.push(command.data);
    } else {
      logger(
        `🔴 [commands:register][WARNING] The command at ${filePath} is missing a required "data" property.`
      );
    }
  }
}

export const commandRegister = async (GUILD_ID, clientItem) => {
  if (clientItem) {
    client = clientItem;
  }

  const rest = new REST().setToken(BOT_TOKEN);
  const guildName = client.guilds.cache.find(
    (guild) => guild.id === GUILD_ID
  ).name;
  (async () => {
    try {
      logger(
        `🚀 [commands:register] Started refreshing ${commands.length} application (/) commands for ${guildName}.`
      );
      const data = await rest.put(
        Routes.applicationGuildCommands(BOT_ID, GUILD_ID),
        { body: commands }
      );
      logger(
        `🟢 [commands:register] Successfully reloaded ${data.length} application (/) commands for ${guildName}.`
      );
    } catch (error) {
      console.error(error);
    }
  })();
};

export const commandRegisterInit = async (clientItem) => {
  client = clientItem;

  try {
    const clientGuildQuantity = client.guilds.cache.map(
      (guild) => guild.id
    ).length;
    const clientGuildIds = client.guilds.cache.map((guild) => guild.id);

    for (let i = 0; i < clientGuildQuantity; i++) {
      await commandRegister(clientGuildIds[i]);
    }
  } catch (error) {
    logger(`🔴 [commands:register:init] ${error}`);
  }
};
