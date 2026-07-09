import database from "@utils/database.js";

export default async function generateCode(length = 5): Promise<string> {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const lockedCodes = ["documents", "login", "me"];

    while (true) {
        const code = Array.from({ length }).map(() => chars[Math.floor(Math.random() * chars.length)]).join("");

        if (lockedCodes.includes(code.toLowerCase())) continue; // Prevent using this code because it is reserved for the API documentation

        const exists = await database.codeExists(code);
        if (!exists) {
            return code;
        }
    }
};