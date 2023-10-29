# staty

Staty is a discord bot that allows you to monitor the status of your APIs regularly and automatically.

<div align="center">
    <p><img src="https://1.images.cdn.digitalteacompany.fr/digitalteacompany/github/staty_couv.png" alt="Staty" /></p>
</div>
<br />

<hr>

[Changelog here](CHANGELOG.md)

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
    "BOT_ID": YOUR_BOT_USER_ID,
    "MONGODB_URL": URL_OF_YOUR_MONGODB_SERVER,
    "PORT": INTEGER
}
```

#### data/config.json

For `ROLE_ID_STATE_PING`, must be provide the role id for your server role. This role has ping when an api has down or re-up.

For all channels, you must provide the exact channel name.

---

### ⚠️

Discord have rate limit of two actions in 10 minutes for bots on update name or description on channel and threads. Your wait time must be `>= 300000` ms ! Now Staty check this value since his version `0.1.5`.

---

```json
{
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
    },
    "database": BOOLEAN
}
```
