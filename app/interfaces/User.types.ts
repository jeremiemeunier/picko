export interface UserTypes {
  personal: {
    mail: String;
    username: String;
    firstname: String;
    lastname: String;
    discord_id: String;
  };
  company: {
    name: String;
    mail: String;
    siret: String;
    tva: String;
  };
  private: {
    token: String;
    salt: String;
    hash: String;
  };
}
