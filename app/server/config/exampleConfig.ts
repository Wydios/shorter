const config = {
    // The Port on which the Shorter server will run. Example: 3000
    port: 3000,

    // Maximum cache entries before the cache is reset
    maxCacheCount: 500,

    // The public base URL of the Shorter service. This is used to generate full short URLs. Example: https://s.yourdomain.com/
    baseUrl: "",

    database: {
        // Your Database username.
        user: "",

        // Your Database password.
        password: "",

        // Your Database name. Example: "shorter"
        database: "shorter",

        // Your Database host / IP address. Example: 127.0.0.1 or localhost
        ip: ""
    },

    // List of blocked domains. Any URL containing one of these strings will not be shortened. Example: ["example.com", "malicious-site"]
    blockedDomains: [
        "twitch.tv" // https://cdn.7tv.app/emote/01F124V4VG0008S1RA006Y72VF/4x.avif as LULE
    ]
};

export default config;