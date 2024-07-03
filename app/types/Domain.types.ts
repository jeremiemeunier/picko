export interface DomainModelTypes {
  _id: String;
  active: Boolean;
  name: String;
  adress: String;
  last_ping: Boolean;
  score: Number;
  mail: String[];
  discord: {
    guild: String;
    role: String;
  };
  users: String[];
  initial: {
    error: Object;
    code: Number;
  };
}
