const commands = {
    name: "setup",
    description: "Make configuration for Staty",
    default_member_permissions: 0,
    database: false,
    options: [
        {
            name: "role",
            description: "Configure a default role for notifications",
            type: 7,
            required: true
        },
        {
            name: "channel",
            description: "Configure a default channel for all api threads",
            type: 8,
            required: true
        }
    ]
};

module.exports = {
    data: commands
}