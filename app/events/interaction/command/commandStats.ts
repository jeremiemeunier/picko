import {
  Events,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
  Client,
} from "discord.js";
import axios from "axios";
import logs from "../../../functions/logs";

const { BOT_ID } = process.env;

export const commandStatsInit = (client: Client) => {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const { commandName } = interaction;

    if (commandName === "stats") {
      const guild = interaction.guildId;

      try {
        const allApiRequest = await axios({
          method: "get",
          url: "http://localhost:3000/api/all",
          params: {
            guild: guild,
          },
          headers: {
            statyid: BOT_ID,
          },
        });

        const allApiData = allApiRequest.data.data;
        const select = new StringSelectMenuBuilder()
          .setCustomId("api_select")
          .setPlaceholder("Choose an api")
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
          content: "Choose an api",
          components: [row],
          ephemeral: true,
        });

        try {
          const collectorFilter = (i: any) => i.user.id === interaction.user.id;
          const confirmation: any = await response.awaitMessageComponent({
            filter: collectorFilter,
            time: 60000,
          });
          const { values } = confirmation;

          try {
            const statsView = await statsMaker(values);
            await interaction.editReply({
              content: `Last 24 hours pings for **${values}** ${statsView}`,
              components: [],
            });
          } catch (error: any) {
            logs("error", "api:stats:list", error);
          }
        } catch (error: any) {
          await interaction.editReply({
            content: "Response not received within 1 minute, cancelling !",
            components: [],
          });
          logs("error", "api:stats:no_response", error);
        }
      } catch (error: any) {
        logs("error", "api:command", error);
      }
    }
  });
};

export const statsMaker = async (id: any) => {
  let returnString = "";

  try {
    const allPings = await axios({
      method: "get",
      url: `http://localhost:3000/ping`,
      headers: {
        statyid: BOT_ID,
      },
      params: {
        id: id,
      },
    });

    const { data } = allPings.data;

    data.map((item: any) => {
      const { state } = item;

      if (state) {
        returnString = returnString + "◼";
      } else {
        returnString = returnString + "◻";
      }
    });

    return "```" + returnString + "```";
  } catch (error: any) {
    logs("error", "api:call", error);
  }
};
