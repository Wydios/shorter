import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "@data/config.js";

import time from "@utils/time.js";
import database from "@utils/db.js";
import { generateCode } from "@short/utils/generate.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class Short {
    private app = express();
    private port = config.port;
    private host = "0.0.0.0";
    private server: any;

    public generate = generateCode;

    constructor() {
        this.app.use(cors());
        this.app.use(express.json());

        this.app.use(express.static(path.join(__dirname, "../public")));

        this.app.get("/", (req, res) => {
            res.json({
                error: false,
                message: `To open a short link, visit: ${config.baseUrl}<code>`
            });
        });

        this.app.get("/:code", async (req, res) => {
            const { code } = req.params;

            const target = await this.resolve(code);
            if (!target) {
                return res.status(404).json({
                    error: true,
                    message: "Short not found or expired. If Your have a Token ur can use https://api.wydios.de/short"
                });
            };

            return res.redirect(target);
        });
    };

    public start(): void {
        this.server = this.app.listen(this.port, this.host, () => {
            console.info(`✅ Shorter läuft auf http://localhost:${this.port}`);
        });
    }; 

    async create(target: string, days = 7): Promise<{ code: string, url: string, expires: Date } | null> {
        if (config.blockedDomains.some(d => target?.toLowerCase().includes(d))) {
            return null;
        };
        
        const code = await this.generate(5);

        const expires = time.date();
        expires.setDate(expires.getDate() + days);

        await Promise.all([
            database.query("INSERT INTO short (code, target, expires_at) VALUES (?, ?, ?)", [code, target, expires]),
            database.deleteExpired()
        ]);

        return { code, url: `${config.baseUrl}${code}`, expires };
    };

    async resolve(code: string): Promise<string | null> {
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
};