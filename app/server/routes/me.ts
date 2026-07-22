import { Request, Response } from "express";
import database from "@utils/database.js";
import { removeCache } from "@utils/cache.js";
import { log } from "@utils/logger.js";
import validToken from "@utils/auth.js";

export async function handlePostMe(req: Request, res: Response) {
    const { username } = req.body;
    const auth = req.headers.authorization;

    if (!username || !auth) {
        return res.status(400).json({
            error: true,
            message: "Username or authorization missing"
        });
    };

    const user = await database.getUser(username);
    if (!user) {
        return res.status(401).json({
            error: true,
            message: "User not found"
        });
    };

    const valid = await validToken(auth.replace("Bearer ", ""), user.password);
    if (!valid) {
        return res.status(401).json({
            error: true,
            message: "Wrong password"
        });
    };

    const shorts = await database.getUserShorts(user.id);

    return res.json({
        error: false,
        user: { 
            login: user.user_login,
            name: user.user_name 
        },
        shorts
    });
};

export async function handleDeleteMe(req: Request, res: Response) {
    const { username, code } = req.body;
    const auth = req.headers.authorization;

    if (!username || !auth) {
        return res.status(400).json({
            error: true,
            message: "Username or authorization missing"
        });
    };

    const user = await database.getUser(username);
    if (!user) {
        return res.status(401).json({
            error: true,
            message: "User not found"
        });
    };

    const valid = await validToken(auth.replace("Bearer ", ""), user.password);
    if (!valid) {
        return res.status(401).json({
            error: true,
            message: "Wrong password"
        });
    };

    const deleted = await database.deleteShort(user.id, code);
    if (!deleted) {
        return res.status(404).json({
            error: true,
            message: "Short not found"
        });
    };

    removeCache(code);

    log(`${user.user_login} deleted short (code: ${code})`);

    return res.json({
        error: false,
        message: "Short deleted"
    });
};