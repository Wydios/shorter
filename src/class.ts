import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "@data/config.js";

import { handleCreate } from "./routers/create.js";
import { handleCode } from "./routers/code.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class Short {
    private app = express();
    private port = config.port;
    private host = "0.0.0.0";
    private server: any;

    constructor() {
        this.app.use(cors());
        this.app.use(express.json());

        this.app.use(express.static(path.join(__dirname, "../public")));

        this.app.get("/", (req, res) => {
            res.json({
                error: false,
                message: `To open a short link, visit: ${config.baseUrl}/<code>`
            });
        });

        this.app.post("/create", handleCreate);
        this.app.get("/:code", handleCode);
    };

    public start(): void {
        this.server = this.app.listen(this.port, this.host, () => {
            console.info(`✅ Shorter läuft auf http://localhost:${this.port}`);
        });
    };
};