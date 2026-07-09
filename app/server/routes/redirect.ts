import { Request, Response } from "express";
import database from "@utils/database.js";

async function resolve(code: string) {
    const entry = await database.getShort(code);
    if (!entry) return null;

    if (new Date(entry.expires_at).getTime() < new Date().getTime()) return null;

    await database.increaseClicks(code);
    return entry;
};

export async function handleCode(req: Request<{ code: string }>, res: Response) {
    const { code } = req.params;

    if (!code || typeof code !== "string") {
        return res.status(400).json({
            error: true,
            message: "No short code provided :("
        });
    };

    const entry = await resolve(code);
    if (!entry) {
        return res.status(404).json({
            error: true,
            message: "This short link does not exist or has expired :("
        });
    };

    return res.redirect(entry.target);
};