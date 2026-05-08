import { createPool, Pool } from "mariadb";
import { config } from "@data/config.js";

class Database {
    private pool: Pool;

    constructor() {
        this.pool = createPool({
            user: config.database.user,
            password: config.database.password,
            database: "shorter",
            host: config.database.ip
        });
    };

    async query<T = any>(queryParam: string, params: any[] = []): Promise<T[]> {
        let connection;
        let result;

        try {
            connection = await this.pool.getConnection();
            result = await connection.query(queryParam, params);
        } catch (error) {
            console.error(`Database | Fehler beim Quern: Query: ${queryParam} Parms: ${params} Error: ${error}`);
            return [];
        } finally {
            connection?.release();
        }

        return result || [];
    };

    async create(code: string, target: string, expiresAt: Date): Promise<void> {
        await this.query("INSERT INTO short (code, target, expires_at) VALUES (?, ?, ?)", [code, target, expiresAt]);
    };

    async get(code: string) {
        const rows = await this.query<{ id: number, code: string, target: string, expires_at: Date, clicks: number }>(
            "SELECT * FROM short WHERE code = ?", [code]
        );

        return rows[0] ?? null;
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

    async getByTarget(target: string) {
        const rows = await this.query<{ code: string, expires_at: Date, clicks: number }>(
            "SELECT * FROM short WHERE target = ? LIMIT 1",
            [target]
        );

        return rows[0] ?? null;
    };
};

const database = new Database();
export default database;