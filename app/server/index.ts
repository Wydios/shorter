import express from "express";
import cors from "cors";
import path from "path";

import { fileURLToPath } from "url";
import config from "@data";
import { info } from "@utils/logger.js";

import { createDocument } from "./routes/api.js";
import { handleLogin } from "./routes/auth.js";
import { handlePostMe, handleDeleteMe } from "./routes/me.js";
import { handleCode } from "./routes/redirect.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "../website")));

app.post("/documents", createDocument);
app.post("/login", handleLogin);
app.post("/me", handlePostMe);
app.delete("/me", handleDeleteMe);
app.get("/:code", handleCode);

app.listen(config.port, "0.0.0.0", () => {
    info(`🚀 Shorter is running on port http://localhost:${config.port}`);
});