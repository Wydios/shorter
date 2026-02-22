import database from "@utils/db.js";

export async function generateCode(length = 5): Promise<string> {
    const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let hasId = true;
    let code = "";

    while (hasId) {
        const randomCode = [...Array(length)].map(() => letters[Math.floor(Math.random() * letters.length)]).join("");

        code = randomCode;
        hasId = await database.codeExists(code);
    }

    return code;
};