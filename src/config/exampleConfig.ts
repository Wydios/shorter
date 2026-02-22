export const config = {
    /**
     * The port on which the Shorter server will run.
     * Example: 3000
     */
    port: 3000,

    /**
     * The public base URL of the Shorter service.
     * This is used to generate full short URLs.
     * Example: https://s.yourdomain.com/
     */
    baseUrl: "",

    /**
     * Database connection configuration.
     */
    database: {
        /**
         * Database username.
         */
        user: "",

        /**
         * Database password.
         */
        password: "",

        /**
         * Database host / IP address.
         * Example: 127.0.0.1 or localhost
         */
        ip: ""
    },

    /**
     * List of blocked domains.
     * Any URL containing one of these strings will not be shortened.
     * Example: ["example.com", "malicious-site"]
     */
    blockedDomains: []
};