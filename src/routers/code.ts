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

    let target = entry.trim();

    if (!/^https?:\/\//i.test(target)) {
        target = "https://" + target;
    }

    const targetPreview = target.replace(/\.(avif|gif|png|jpg|jpeg|webp)$/i, "") + ".webp";

    res.type('html');

    return res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Wydiso • Short</title>
            <meta property="og:title" content="Wydiso Shorter Preview">
            <meta property="og:description" content="Click to view the shared content">
            <meta property="og:image" content="${targetPreview}">
            <meta property="og:image:type" content="image/webp">
            <meta property="og:type" content="website">
            <meta name="twitter:card" content="summary_large_image">
            <meta name="twitter:image" content="${targetPreview}">
            <script>
                window.location.replace("${target}");
            </script>
            <meta http-equiv="refresh" content="0;url=${target}">
        </head>
        <body style="background: #0e0e0e; color: white; font-family: sans-serif;">
            Redirecting to <a href="${target}" style="color: #3498db;">${target}</a>...
        </body>
        </html>
    `);
};