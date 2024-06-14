# staty

Staty is a discord bot that allows you to monitor the status of your APIs regularly and automatically.

## Deployment

The following assumes you have Git, and Docker installed. Copy all files and just run this command :

```bash
docker composer up -d --build
```

---

[Changelog here](CHANGELOG.md)

## Configuration files

For configuration of Staty you must have these files : [data/secret.json](https://github.com/DigitalTeaCompany/staty/blob/main/config/secret.sample.json),
[data/config.json](https://github.com/DigitalTeaCompany/staty/blob/main/config/global.sample.json).

### Configuration

To create your discord app : [Discord Developers](https://discord.com/developers/applications)

> [!WARNING]
> Discord have rate limit of two actions in 10 minutes for bots on update name or description on channel and threads. Your wait time must be `>= 300000` ms ! Now Staty check this value since his version `0.1.5`.
