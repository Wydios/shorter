import { createPool, Pool } from "mariadb";
import { error } from "@utils/logger.js";
import config from "@data";

interface User {
    id: number,
    user_login: string,
    user_name: string,
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

interface DeleteResult {
    affectedRows: number
};

class Database {
    private pool: Pool;
    private readonly usersTable: string;

    constructor() {
        this.pool = createPool({
            user: config.database.user,
            password: config.database.password,
            database: config.database.database,
            host: config.database.ip,
            connectionLimit: 10
        });

        this.usersTable = config.database.userDatabase
            ? `${config.database.userDatabase}.users`
            : "users";
    };

    async execute<T = any>(queryParam: string, params: any[] = []): Promise<T> {
        let connection;

        try {
            connection = await this.pool.getConnection();

            const result = await connection.query(queryParam, params);

            return result as T;
        } catch (err) {
            error(`Database | Error Query: ${queryParam} Params: ${params}`, err);
            throw err;
        } finally {
            connection?.release();
        }
    };

    async query<T = any>(queryParam: string, params: any[] = []): Promise<T[]> {
        const result = await this.execute<any>(queryParam, params);
        return Array.isArray(result) ? result : [result];
    };

    async getUser(userName: string): Promise<User | null> {
        const users = await this.query<User>(
            `SELECT * FROM ${this.usersTable} WHERE user_login = ? LIMIT 1`,
            [userName?.toLowerCase()]
        );

        return users[0] ?? null;
    };

    async getUserShorts(userId: number): Promise<Short[]> {
        return await this.query<Short>(
            "SELECT * FROM shorts WHERE user_id = ? ORDER BY created_at DESC",
            [userId]
        );
    };

    async getShortByTarget(userId: number, target: string): Promise<Short | null> {
        const rows = await this.query<Short>(
            "SELECT * FROM shorts WHERE user_id = ? AND target = ? LIMIT 1",
            [userId, target]
        );

        return rows[0] ?? null;
    };

    async createShort(userId: number, code: string, target: string, expiresAt: Date): Promise<void> {
        await this.execute(
            "INSERT INTO shorts (user_id, code, target, expires_at) VALUES (?, ?, ?, ?)", 
            [userId, code, target, expiresAt]
        );
    };

    async getShort(code: string): Promise<Short | null> {
        const rows = await this.query<Short>(
            "SELECT * FROM shorts WHERE code = ? LIMIT 1",
            [code]
        );

        return rows[0] ?? null;
    };

    async codeExists(code: string): Promise<boolean> {
        return (await this.query("SELECT id FROM shorts WHERE code = ? LIMIT 1", [code])).length > 0;
    };

    async increaseClicks(code: string): Promise<void> {
        await this.execute("UPDATE shorts SET clicks = clicks + 1 WHERE code = ?", [code]);
    };

    async updateExpiresAt(id: number, expires: Date): Promise<void> {
        await this.execute(
            "UPDATE shorts SET expires_at = ? WHERE id = ?",
            [expires, id]
        );
    };

    async deleteShort(userId: number, code: string): Promise<boolean> {
        const result = await this.execute<DeleteResult>(
            "DELETE FROM shorts WHERE user_id = ? AND code = ?",
            [userId, code]
        );

        return result.affectedRows > 0;
    };

    async deleteExpired(): Promise<void> {
        await this.execute("DELETE FROM shorts WHERE expires_at < NOW()");
    };
};

const database = new Database();

export default database;