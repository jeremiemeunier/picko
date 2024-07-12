export default {
  name: "setup",
  description: "Make configuration for picko",
  default_member_permissions: 0,
  database: false,
  options: [
    {
      name: "channel",
      description: "Configure a default channel for api threads",
      type: 7,
      required: true,
    },
    {
      name: "role",
      description: "Configure a default role for all notifications",
      type: 8,
      required: true,
    },
  ],
};
