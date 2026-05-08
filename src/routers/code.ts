import { Request, Response } from "express";
import { config } from "@data/config.js";
import time from "@utils/time.js";
import database from "@utils/db.js";
import ogs from "open-graph-scraper";

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

    let target = entry.trim();

    if (!/^https?:\/\//i.test(target)) {
        target = "https://" + target;
    }
    
    let title = "Wydios Shorter";
    let description = "Click to open";
    let image = "";

    try {
        const result = await ogs({ 
            url: target,
            fetchOptions: {
                headers: {
                    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
                }
            }
        });

        title = result.result.ogTitle || title;
        description = result.result.ogDescription || description;
        image = result.result.ogImage?.[0]?.url || image;
    } catch (err) {
        console.log("OG fetch failed");
    }

    return res.send(`<!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta property="og:title" content="${title}">
            <meta property="og:description" content="${description}">
            <meta property="og:image" content="${image}">
            <meta property="og:url" content="${config.baseUrl}/${code}">
            <meta name="twitter:card" content="summary_large_image">
            <meta http-equiv="refresh" content="0; url=${target}">
        </head>
        <body>
            Redirecting...
        </body>
        </html>
    `);
};