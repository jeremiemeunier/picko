# Incoming features

- [x] Slash command for statistic when using database
- [x] Auto rebind on existing thread wehn staty restart
- [ ] Button enforce ping on an specific API when is down
- [x] Rework of all logs

## Changelog

### `2.0.1`

- Add new route `/ping/extern/stats` returning directly up and down time percentage
- Fixing crash on getting a route without `Authorization` header
- Staty send a message in configured channel with ping role associated on api to notify when api is down or reup
- Reduce waiting time between two ping to 1 minute
- Set default external port binding to `3007`
- Docker image is now staged when is builded

### `2.0.0`

- Now staty use dedicated mongodb instance
- Move to builded version using typescript
- Logs are now grouped by day and by api

### `1.0.0`

- Now staty create a thread only on error ping and delete this thread on next success ping on api
- Using fresh data on pinging api

### `0.1.9`

- Add configuration by database
- Add 2 new slash commands
  - `/api [add|remove]` for add and remove api from the list
  - `/setup` for setting up in your server
- Move to a Docker system with the Dockerfile

### `0.1.8`

- Add auto rebind on active thread for api pinging
- Delete auto thread for removed api on configuration

### `0.1.7`

- Add slash command for stats on all api when use database

### `0.1.6`

- Add optionnal support of MongoDB for a incomming statistics slash command (Require a `MONGODB_URL` indicate in `secret.json` configuration file)
- Add optionnal API (Require a `PORT` for listening in `secret.json` configuration file)
- New option add in `global.json` configuration file

```json
{
  "database": true
}
```

- Move all pinging code in dedicated file
- Homogenization of all logs

### `0.1.5`

- Staty now create only a thread with the name of API
- Thread name has update on API ping
- The delays parameter is now checked to be strictly `>=` to 5 minutes

### `0.1.4`

- Modifies the announcement to use the dedicated role ID if configured

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
