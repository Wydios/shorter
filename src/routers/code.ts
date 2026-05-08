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
    
    return res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Wydiso • Short</title>
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    background-color: #0e0e0e;
                    font-family: sans-serif;
                }
                img {
                    max-width: 95%;
                    max-height: 95vh;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                    border-radius: 8px;
                    object-fit: contain;
                }
            </style>
        </head>
        <body>
            <img src="${target}" alt="Shared Image" />
        </body>
        </html>
    `);
};