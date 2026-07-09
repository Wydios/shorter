import { Request, Response } from "express";
import database from "@utils/database.js";

export async function handleMe(req: Request, res: Response) {
    const { username } = req.body;
    const auth = req.headers.authorization;

    if (!username || !auth) {
        return res.status(400).json({
            error: true,
            message: "Username or authorization missing"
        });
    };

    const password = auth.replace("Bearer ", "");

    const user = await database.getUser(username);
    if (!user) {
        return res.status(401).json({
            error: true,
            message: "User not found"
        });
    };

    if (user.password !== password) {
        return res.status(401).json({
            error: true,
            message: "Wrong password"
        });
    };

    const shorts = await database.getUserShorts(user.id);

    return res.json({
        error: false,
        user: {
            username: user.username
        },
        shorts
    });
};