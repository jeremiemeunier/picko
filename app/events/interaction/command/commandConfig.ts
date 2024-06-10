import { Client, Events } from "discord.js";
import axios from "axios";
import logs from "../../../functions/logs";

const { BOT_ID } = process.env;

export const commandConfigInit = (client: Client) => {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const { commandName } = interaction;

    if (commandName === "setup") {
      try {
        const guild = interaction.guildId;
        const channel = interaction.options.getChannel("channel")?.id;
        const role = interaction.options.getRole("role")?.id;

        const registerSetup = await axios({
          method: "post",
          url: "http://localhost:3000/setup/",
          headers: {
            statyid: BOT_ID,
          },
          data: {
            guild: guild,
            channel: channel,
            role: role,
          },
        });

        await interaction.reply({
          content: "Your setup is ready",
          ephemeral: true,
        });
      } catch (error: any) {
        logs("error", "setup:", error);
      }
    }
  });
};
