const commands = {
    name: "setup",
    description: "Make configuration for Staty",
    default_member_permissions: 0,
    database: false,
    options: [
        {
            name: "role",
            description: "Configure a role for notifications",
            type: 1,
            options: [
                {
                    name: "statyrole",
                    description: "A role",
                    type: 8,
                    required: true
                }
            ]
        },
        {
            name: "channel",
            description: "Configure a channel for notifications",
            type: 1,
            options: [
                {
                    name: "statychannel",
                    description: "A channel",
                    type: 7,
                    required: true
                }
            ]
        },
        {
            name: "api",
            description: "Add an api for notifications",
            type: 1
        },
    ]
};

module.exports = {
    data: commands
}