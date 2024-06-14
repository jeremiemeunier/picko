import {
  Events,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
  Client,
} from "discord.js";
import axios from "axios";
import logs from "../../../functions/logs";
import StatyAxios from "../../../libs/StatyAxios";

const { BOT_ID } = process.env;

export const commandStatsInit = (client: Client) => {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const { commandName } = interaction;

    if (commandName === "stats") {
      const guild = interaction.guildId;

      try {
        const allApiRequest = await axios.get(
          `http://localhost:3000/api/all/${guild}`,
          {
            headers: {
              Authorization: `Bearer ${BOT_ID}`,
            },
          }
        );

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
              content: `Last 90 days pings for **${values}**\r\n ${statsView}`,
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
  const downTime = [];
  const upTime = [];
  const totalTime = [];

  try {
    const allPings = await StatyAxios.get(`/ping/${id}`);

    const { data } = allPings.data;

    data.map((item: any) => {
      const { pings } = item;

      pings.map((ping: any) => {
        ping.state ? upTime.push(ping) : downTime.push(ping);
        totalTime.push(ping);
      });
    });

    const upTimePercent = (upTime.length / totalTime.length) * 100;
    const downTimePercent = (downTime.length / totalTime.length) * 100;

    return `Uptime : ${upTimePercent.toFixed(
      2
    )}% • Downtime : ${downTimePercent.toFixed(2)}%`;
  } catch (error: any) {
    logs("error", "api:call", error);
  }
};
