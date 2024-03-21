import { EmbedBuilder, ChannelType, time } from "discord.js";
import axios from "axios";
import { logger } from "./logger";

export const statyPing = async (apiData, params) => {
  const { state, role, guild, wait } = params;
  const waitingTime = wait >= 300000 ? wait : 300000;

  try {
    // on error create a thread to details error and ping user
    // on start and success nothings

    let lastApiState = 0;
    let threadPing;
    let apiFetchedData;

    const pingInterval = setInterval(async () => {
      const now = new Date();

      try {
        // check if this api has removed from watching
        const apiCheck = await axios.get("/api/id", {
          params: {
            id: apiData._id,
          },
          headers: {
            statyid: process.env.BOT_ID,
          },
        });

        apiFetchedData = apiCheck.data;

        try {
          // now check health of api endpoint
          await axios({
            method: "get",
            url: apiFetchedData.api_adress,
          });

          // api respond with an success code
          // register the ping to indicate an up api
          try {
            await axios.post(
              "/ping",
              {
                name: apiFetchedData.api_name,
                state: true,
                date: now,
                api: apiFetchedData._id,
              },
              {
                headers: {
                  statyid: process.env.BOT_ID,
                },
              }
            );
          } catch (error) {
            logger(`🔴 [ping:database:register] ${error}`);
          }

          if (lastApiState < 0) {
            if (
              state.threads.cache.find((thread) =>
                thread.name.endsWith(apiFetchedData.api_name)
              )
            ) {
              /*
               * if last state is down and if exist a thread
               * we remove thread
               */
              const failureThread = state.threads.cache.find((thread) =>
                thread.name.endsWith(apiFetchedData.api_name)
              );

              try {
                await failureThread.delete();
              } catch (error) {
                logger(`🔴 [ping:remove_failure_thread] ${error}`);
              }
            }
          }
        } catch (error) {
          console.log(error);
          // api respond with an error code
          // register the ping to indicate a down api
          try {
            await axios.post(
              "/ping",
              {
                name: apiFetchedData.api_name,
                state: false,
                date: now,
                api: apiFetchedData._id,
              },
              {
                headers: {
                  statyid: process.env.BOT_ID,
                },
              }
            );
          } catch (error) {
            logger(`🔴 [ping:database:register] ${error}`);
          }

          // check previous state of api
          if (lastApiState === 1 || lastApiState === 0) {
            /*
             * last ping is start ping or up
             * create a thread to ping and indicate error
             * send error message for console error
             */
            try {
              threadPing = await state.threads.create({
                name: `🔴 ${apiFetchedData.api_name}`,
                autoArchiveDuration: 60,
                reason: `Dedicated thread for pinging api ${apiFetchedData.api_name}`,
                type: ChannelType.PrivateThread,
              });

              // Creating embed and send
              const pingInit = new EmbedBuilder()
                .setColor(parseInt("E9D84E", 16))
                .setDescription(`🔴 ${apiFetchedData.api_adress}`);
              const downConsole = new EmbedBuilder()
                .setColor(parseInt("E9D84E", 16))
                .setTitle(`API is down !`)
                .setDescription(
                  `Find here log for latest ping\r\n\`\`\`An error occured on API ping for ${apiFetchedData.api_adress} → ${error.response.status} [${error.message}]\`\`\``
                );
              await threadPing.send({
                content: `<@&${apiFetchedData.role ? apiFetchedData.role : role}>`,
                embeds: [pingInit, downConsole],
              });
            } catch (error) {
              logger(`🔴 [ping:create_send_thread] ${error}`);
            }

            lastApiState = parseInt(lastApiState) - 1;
          }
        }
      } catch (error) {
        // this api has removed from watching
        logger(`🔴 [ping:inactive_ping] ${error}`);
        clearInterval(pingInterval);
      }
    }, waitingTime);
  } catch (error) {
    logger(`🔴 [ping:global] ${error}`);
  }
};
