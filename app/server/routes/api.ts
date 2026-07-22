import { Request, Response } from "express";
import database from "@utils/database.js";
import generateCode from "@utils/generate.js";
import { setCache, cleanupCache } from "@utils/cache.js";
import { log } from "@utils/logger.js";
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
            error: true,
            message: "Invalid URL. Please provide a valid link :P"
        });
    };

    if (config.blockedDomains.some(domain => url.toLowerCase().includes(domain))) {
        return res.status(403).json({
            error: true,
            message: "Oops! This domain is blocked and cannot be shortened >:o"
        });
    };

    const expires = new Date();
    const expireDays = Math.min(Number(days) || 7, 7);
    expires.setDate(expires.getDate() + expireDays);

    await database.deleteExpired();
    cleanupCache();

    const existing = await database.getShortByTarget(user.id, url);
    if (existing) {
        await database.updateExpiresAt(existing.id, expires);

        setCache(existing.code, {
            code: existing.code,
            url: `${config.baseUrl}/${existing.code}`,
            target: existing.target,
            expires
        }, expireDays * 86400);

        log(`${user.username} refreshed the expiration time for ${url} (code: ${existing.code})`);

        return res.json({
            error: false,
            message: "Found your existing short link and refreshed the expiration time ;)",
            short: {
                code: existing.code,
                url: `${config.baseUrl}/${existing.code}`,
                target: existing.target,
                expires
            }
        });
    };

    const code = await generateCode(5);

    await database.createShort(user.id, code, url, expires);

    setCache(code, {
        code,
        url: `${config.baseUrl}/${code}`,
        target: url,
        expires
    }, expireDays * 86400);

    log(`${user.username} created a new short link for ${url} (code: ${code})`);

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