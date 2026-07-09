import { Request, Response } from "express";
import database from "@utils/database.js";
import generateCode from "@utils/generate.js";
import config from "@data";

export async function createDocument(req: Request, res: Response) {
    const { url, days, username } = req.body;
    const authorization = req.headers.authorization;

    if (!authorization) {
        return res.status(401).json({
            error: true,
            message: "Missing authorization header :("
        });
    };

    const [type, password] = authorization.split(" ");

    if (type !== "Bearer" || !password) {
        return res.status(401).json({
            error: true,
            message: "Invalid authorization format. Please use 'Bearer <password>' :P"
        });
    };

    if (!username) {
        return res.status(400).json({
            error: true,
            message: "Missing username in request body :O"
        });
    };

    const user = await database.getUser(username);
    if (!user) {
        return res.status(401).json({
            error: true,
            message: "User not found. Please check your username >:)"
        });
    };

    if (user.password !== password) {
        return res.status(401).json({
            error: true,
            message: "Wrong password. Please try again XD"
        });
    };

    if (!url || typeof url !== "string") {
        return res.status(400).json({
            error:true,
            message: "Invalid URL. Please provide a valid link :P"
        });
    };

    if (config.blockedDomains.some(domain => url.toLowerCase().includes(domain))) {
        return res.status(403).json({
            error:true,
            message: "Oops! This domain is blocked and cannot be shortened >:o"
        });
    };

    const expires = new Date();
    const expireDays = Math.min(Number(days) || 7, 365);
    expires.setDate(expires.getDate() + expireDays);

    const existing = await database.getByTarget(user.id, url);
    if (existing) {
        await database.query(
            "UPDATE short SET expires_at = ? WHERE id = ?",
            [expires, existing.id]
        );

        return res.json({
            error:false,
            message: "Found your existing short link and refreshed the expiration time ;)",
            short: {
                code: existing.code,
                url: `${config.baseUrl}/${existing.code}`,
                expires
            }
        });
    };

    const code = await generateCode(5);

    await Promise.all([
        database.createShort(user.id, code, url, expires),
        database.deleteExpired()
    ]);

    return res.json({
        error: false,
        message: "Done! Your short link is ready to use :)",
        short: {
            code,
            url: `${config.baseUrl}/${code}`,
            target: url,
            expires
        }
    });
};