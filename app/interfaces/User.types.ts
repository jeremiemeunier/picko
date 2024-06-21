interface GuildTypes {
  id: String;
  name: String;
  icon: String;
  owner: Boolean;
  permissions: String;
  features: Object;
  approximate_member_count: Number;
  approximate_presence_count: Number;
}

export interface UserTypes {
  personal: {
    mail: String;
    username: String;
    firstname: String;
    lastname: String;
    discord: {
      id: String;
      guilds: GuildTypes[];
    };
    avatar: String;
  };
  company: {
    name: String;
    mail: String;
    siret: String;
    tva: String;
  };
  token: String;
  refresh_token: String;
  expires_in: Number | String;
  type: String;
}
