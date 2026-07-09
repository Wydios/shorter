module.exports = {
    apps: [
        {
            name: "shorter",
            script: "app/server/index.ts",
            interpreter: "node",
            interpreter_args: "--import tsx",
            watch: false,
            env: {
                NODE_ENV: "production"
            }
        }
    ]
};