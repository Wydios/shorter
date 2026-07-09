import { createPool, Pool } from "mariadb";
import { log, error } from "@utils/logger.js";
import config from "@data";

interface User {
    id: number,
    username: string,
    password: string,
    created_at: Date
};

interface Short {
    id: number,
    user_id: number,
    code: string,
    target: string,
    created_at: Date,
    expires_at: Date,
    clicks: number
};

class Database {
    private pool: Pool;

    constructor() {
        this.pool = createPool({
            user: config.database.user,
            password: config.database.password,
            database: config.database.database,
            host: config.database.ip,
            connectionLimit: 10
        });
    };

    async query<T = any>(queryParam: string, params: any[] = []): Promise<T[]> {
        let connection;

        try {
            connection = await this.pool.getConnection();

            const result = await connection.query(queryParam, params);

            return result as T[];
        } catch (err) {
            error(`Database | Error Query: ${queryParam} Parms: ${params},`, err);
            return [];
        } finally {
            connection?.release();
        }
    };

    async getUser(userName: string): Promise<User | null> {
        const users = await this.query<User>(
            "SELECT * FROM users WHERE username = ? LIMIT 1",
            [userName?.toLowerCase()]
        );

        return users[0] ?? null;
    };

    async getUserById(userId: number): Promise<Pick<User, "id" | "username"> | null> {
        const users = await this.query<Pick<User, "id" | "username">>(
            "SELECT id, username FROM users WHERE id = ? LIMIT 1",
            [userId]
        );

        return users[0] ?? null;
    };

    async createShort(userId: number, code: string, target: string, expiresAt: Date): Promise<void> {
        await this.query(
            "INSERT INTO short (user_id, code, target, expires_at) VALUES (?, ?, ?, ?)", 
            [userId, code, target, expiresAt]
        );
    };

    async getShort(code: string): Promise<Short | null> {
        const rows = await this.query<Short>(
            "SELECT * FROM short WHERE code = ? LIMIT 1",
            [code]
        );

        return rows[0] ?? null;
    };

    async getUserShorts(userId: number): Promise<Short[]> {
        return await this.query<Short>(
            "SELECT * FROM short WHERE user_id = ? ORDER BY created_at DESC",
            [userId]
        );
    };

    async codeExists(code: string): Promise<boolean> {
        return (await this.query("SELECT id FROM short WHERE code = ? LIMIT 1", [code])).length > 0;
    };

    async increaseClicks(code: string): Promise<void> {
        await this.query("UPDATE short SET clicks = clicks + 1 WHERE code = ?", [code]);
    };

    async deleteExpired(): Promise<void> {
        await this.query("DELETE FROM short WHERE expires_at < NOW()");
    };

    async getByTarget(userId: number, target: string): Promise<Short | null> {
        const rows = await this.query<Short>(
            "SELECT * FROM short WHERE user_id = ? AND target = ? LIMIT 1",
            [userId, target]
        );

        return rows[0] ?? null;
    };
};

const database = new Database();

export default database;