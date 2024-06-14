import { readdirSync } from "node:fs";
import { join } from "node:path";
import { REST, Routes } from "discord.js";
import logs from "./logs";

const commands: any[] = [];
const foldersPath = join(__dirname, "../commands");
const commandFolders = readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = join(foldersPath, folder);
  const commandFiles = readdirSync(commandsPath).filter(
    (file) => file.endsWith(".ts") || file.endsWith(".js")
  );

  for (const file of commandFiles) {
    const filePath = join(commandsPath, file);
    const command = require(filePath);

    if ("default" in command) {
      commands.push(command.default);
    } else {
      logs(
        "warning",
        "cmd:register",
        `The command at ${filePath} is missing a required "data" property.`
      );
    }
  }
}

export const register_in_guild = async (guild: string) => {
  const { BOT_TOKEN, BOT_ID } = process.env;

  if (BOT_TOKEN && BOT_ID) {
    const rest = new REST().setToken(BOT_TOKEN);
    (async () => {
      try {
        logs(
          "start",
          "cmd:register",
          `Started refreshing ${commands.length} application (/) commands.`,
          guild
        );
        const data: any = await rest.put(
          Routes.applicationGuildCommands(BOT_ID, guild),
          {
            body: commands,
          }
        );

        logs(
          "success",
          "cmd:register",
          `Successfully reloaded ${data.length} application (/) commands.`,
          guild
        );
      } catch (error) {
        console.error(error);
      }
    })();
  } else {
    logs("error", "cmd:register", "Missing env config");
  }
};

export const register = async () => {
  const { BOT_TOKEN, BOT_ID } = process.env;

  if (BOT_TOKEN && BOT_ID) {
    const rest = new REST().setToken(BOT_TOKEN);
    (async () => {
      try {
        logs(
          "start",
          "cmd:register",
          `Started refreshing ${commands.length} application (/) commands.`
        );
        const data: any = await rest.put(Routes.applicationCommands(BOT_ID), {
          body: commands,
        });

        logs(
          "success",
          "cmd:register",
          `Successfully reloaded ${data.length} application (/) commands.`
        );
      } catch (error) {
        console.error(error);
      }
    })();
  } else {
    logs("error", "cmd:register", "Missing env config");
  }
};
