interface PingDetailsType {
  state: String;
  date: String;
}

export interface PingTypes {
  guild_id: String;
  api_id: String;
  day: String;
  pings: PingDetailsType[];
}
