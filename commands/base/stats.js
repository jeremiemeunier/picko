const commands = {
  name: "stats",
  description: "Return statistics of last 24 hours for api",
  default_member_permissions: 0,
  database: true,
};

module.exports = {
  data: commands,
};
