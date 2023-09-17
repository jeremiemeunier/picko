# staty

Staty is a discord bot that allows you to monitor the status of your APIs regularly and automatically.

<div align="center">
    <p><img src="https://1.images.cdn.digitalteacompany.fr/digitalteacompany/github/staty.png" alt="Pastille" /></p>
    <br>
      <p>
            Dependencies<br>
            <a href="https://www.npmjs.com/package/discord.js"><img alt="npm" src="https://img.shields.io/npm/v/discord.js?label=discord.js"></a>
            <a href="https://www.npmjs.com/package/axios"><img alt="npm" src="https://img.shields.io/npm/v/axios?label=axios"></a>
            <a href="https://www.npmjs.com/package/@discordjs/rest"><img alt="npm" src="https://img.shields.io/npm/v/@discordjs/rest?label=@discordjs/rest"></a>
      </p>
</div>
<br />

## Changelog

### `0.1.5`
 - Staty now create only a thread with the name of API
 - Thread name has update on API ping
 - The delays parameter is now checked to be strictly `>=` to 5 minutes

### `0.1.4`
- Modifies the announcement to use the dedicated role ID if configured<br>
```json
{
    "adress": HTTP_API_ADRESS,
    "name": API_NAME,
    "role": ROLE_ID
}
```
- Staty now uses the Discord `Embed` element to send current status and last ping to global ping channel
- Staty creates a thread on the ping message and marks the global or dedicated role to add all affected users

### `0.1.3`
 - Staty send a message to global ping channel
 - Staty update message on api update
 - Staty use 6 different state for api state :
   - 🚀 Staty launch and wait first ping for state
   - 🟢 API is up ! Everything is good
   - 🟠 API is re-up ! Last ping : API is down but now is up
   - 🔴 API is down ! First ping
   - 🔥 API is down ! Second ping
   - ⚫ API is down ! Third and up
  
<hr>

## Configuration files

For configuration of Staty you must have these files : [data/secret.json](https://github.com/DigitalTeaCompany/staty/blob/main/config/secret.sample.json),
[data/config.json](https://github.com/DigitalTeaCompany/staty/blob/main/config/global.sample.json), [data/api.json](https://github.com/DigitalTeaCompany/staty/blob/main/config/api.sample.json).

You can pass a `role_id` to ping dedicated group on an api.

#### data/secret.json

To create your discord app : [Discord Developers](https://discord.com/developers/applications)<br />

```json
{
    "BOT_TOKEN": YOUR_DISCORD_BOT_TOKEN_ID,
    "BOT_OWNER_ID": YOUR_DISCORD_ID,
    "GUILD_ID": YOUR_DISCORD_SERVER_ID,
    "BOT_ID": YOUR_BOT_USER_ID
}
```

#### data/config.json

For `ROLE_ID_STATE_PING`, must be provide the role id for your server role. This role has ping when an api has down or re-up.

For all channels, you must provide the exact channel name.

-----------

### ⚠️
Discord have rate limit for bot on update name or description on channel and threads. Your wait time must be `>= 300000` ! Now Staty check this value since `0.1.5`.

-----------

```json
{
    "version": CURRENT_VERSION,
    "options": {
        "wait": WAITING_TIME_IN_MS,
        "color": HEXADECIMAL_CODE,
        "name": "Staty",
        "role": ROLE_ID_STATE_PING,
    },
    "channels": {
        "console": NAME_OF_CHANNEL_FOR_CONSOLE,
        "debug": NAME_OF_CHANNEL_FOR_LOGS,
        "state": NAME_OF_CHANNEL_FOR_STATE
    }
}
```
