import { login } from "./auth.js";
import { createShort } from "./shorter.js";
import "./navbar.js";

document.getElementById("loginButton").addEventListener("click", login);
document.getElementById("createButton").addEventListener("click", createShort);