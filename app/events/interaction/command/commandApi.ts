import {
  Events,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
  Guild,
  Client,
} from "discord.js";
import axios from "axios";
import logs from "../../../functions/logs";

const { BOT_ID } = process.env;

export const commandApiInit = (client: Client) => {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const { commandName } = interaction;

    if (commandName === "api") {
      if (interaction.options.getSubcommand() === "add") {
        try {
          const guildId = interaction.guildId;
          const guild = client.guilds.cache.find(
            (guild) => guild.id === guildId
          );
          const apiName = interaction.options.getString("name");
          const apiAdress = interaction.options.getString("adress");
          let role: string | undefined | null = "";

          if (interaction.options.getRole("role")) {
            role = interaction.options.getRole("role")?.id;
          } else {
            role = null;
          }

          const registerSetup = await axios.post(
            `http://localhost:3000/api`,
            { guild: guildId, role: role, adress: apiAdress, name: apiName },
            {
              headers: {
                Authorization: `Bearer ${BOT_ID}`,
              },
            }
          );

          await interaction.reply({
            content:
              "Your api has added to ping list, await automatic restart for pinging",
            ephemeral: true,
          });
        } catch (error: any) {
          logs("error", "command:api:setup", error);
        }
      } else if (interaction.options.getSubcommand() === "remove") {
        const guildId = interaction.guildId;
        const guild = client.guilds.cache.find(
          (guild: Guild) => guild.id === guildId
        );

        try {
          const allApiRequest = await axios.get(
            `http://localhost:3000/api/all/${guildId}`,
            {
              headers: {
                Authorization: `Bearer ${BOT_ID}`,
              },
            }
          );

          const allApiData = allApiRequest.data.data;

          if (allApiData) {
            const select = new StringSelectMenuBuilder()
              .setCustomId("api_select")
              .setPlaceholder("Choose an api to remove")
              .addOptions(
                allApiData.map((item: any) => {
                  const { api_name, api_adress, _id } = item;
                  return new StringSelectMenuOptionBuilder()
                    .setLabel(api_name)
                    .setDescription(api_adress)
                    .setValue(_id);
                })
              );
            const row: any = new ActionRowBuilder().addComponents(select);
            const response = await interaction.reply({
              content: "Choose an api to remove",
              components: [row],
              ephemeral: true,
            });

            try {
              const collectorFilter = (i: any) =>
                i.user.id === interaction.user.id;
              const confirmation: any = await response.awaitMessageComponent({
                filter: collectorFilter,
                time: 60000,
              });
              const { values } = confirmation;

              try {
                const deleted = await axios.delete(
                  `http://localhost:3000/api/${values}`,
                  {
                    headers: {
                      Authorization: `Bearer ${BOT_ID}`,
                    },
                  }
                );

                interaction.editReply({
                  content: "Api removed from pinging",
                  components: [],
                });
              } catch (error: any) {
                logs("error", "command:api:remove_request", error);
              }
            } catch (error: any) {
              await interaction.editReply({
                content: "Response not received within 1 minute, cancelling !",
                components: [],
              });
              logs("error", "command:api:remove:no_response", error);
            }
          }
        } catch (error: any) {
          logs("error", "command:api:remove", error);
        }
      } else {
        interaction.reply({ content: "Invalid command", ephemeral: true });
      }
    }
  });
};
