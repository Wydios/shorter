import { Request, Response } from "express";
import database from "@utils/database.js";
import { getCache, setCache } from "@utils/cache.js";
import config from "@data";

function normalizeUrl(url: string): string {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        return "https://" + url;
    };

    return url;
};

async function resolve(code: string) {
    const cached = getCache(code);
    if (cached) {
        await database.increaseClicks(code);
        return cached;
    };

    const entry = await database.getShort(code);
    if (!entry) return null;

    if (new Date(entry.expires_at).getTime() < new Date().getTime()) return null;

    const expiresSeconds = Math.max(1, Math.floor((new Date(entry.expires_at).getTime() - Date.now()) / 1000));

    setCache(code, {
        code: entry.code,
        url: `${config.baseUrl}/${code}`,
        target: entry.target,
        expires: new Date(entry.expires_at)
    }, expiresSeconds);

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

    return res.redirect(normalizeUrl(entry.target));
};