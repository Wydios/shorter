import { Request, Response } from "express";
import time from "@utils/time.js";
import database from "@utils/db.js";

async function resolve(code: string): Promise<string | null> {
    const entry = await database.get(code);
    if (!entry) {
        return null;
    };

    if (time.date(entry.expires_at).getTime() < time.now()) {
        return null;
    };

    await database.increaseClicks(code);
    return entry.target;
};

export async function handleCode(req: Request<{ code: string }>, res: Response) {
    const code = req.params.code;
    if (!code || typeof code !== "string") {
        res.status(400).json({ error: true, message: "No Code in the Url" });
    };

    const entry = await resolve(code);
    if (!entry) {
        return res.status(404).json({
            error: true,
            message: "Short not found or expired"
        });
    };

    return res.redirect(entry);
};