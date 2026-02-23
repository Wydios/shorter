import { Request, Response } from "express";
import time from "@utils/time.js";
import database from "@utils/db.js";
import { generateCode } from "@short/utils/generate.js";
import { config } from "@data/config.js";

export async function handleCreate(req: Request, res: Response) {
    const { url, days, accessToken } = req.body;

    if (!accessToken || typeof accessToken !== "string") {
        return res.status(401).json({
            error: true,
            message: "Missing accessToken"
        });
    };

    if (accessToken !== config.accessToken) {
        return res.status(403).json({
            error: true,
            message: "Invalid accessToken"
        });
    };

    if (!url || typeof url !== "string") {
        return res.status(400).json({
            error: true,
            message: "Invalid URL"
        });
    };

    if (config.blockedDomains.some(d => url.toLowerCase().includes(d))) {
        return res.status(403).json({
            error: true,
            message: "Blocked domain"
        });
    };

    const code = await generateCode(5);

    const expires = time.date();
    expires.setDate(expires.getDate() + (days ?? 7));

    await Promise.all([
        database.query(
            "INSERT INTO short (code, target, expires_at) VALUES (?, ?, ?)",
            [code, url, expires]
        ),
        database.deleteExpired()
    ]);

    return res.json({
        error: false,
        code,
        shortUrl: `${config.baseUrl}${code}`,
        expires
    });
};