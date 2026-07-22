import { Request, Response } from "express";
import database from "@utils/database.js";

export async function handleLogin(req: Request, res: Response) {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            error: true,
            message: "Username or password missing"
        });
    };

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

    return res.json({
        error: false,
        message: "Login successful",
        user: { username: user.username }
    });
};