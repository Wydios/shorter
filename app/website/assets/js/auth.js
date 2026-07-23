import { loadShorts } from "./shorter.js";

let session = {
    username: null,
    password: null
};

async function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    if (!username || !password) {
        return alert("Please enter username and password.");
    };

    const response = await fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username,
            password
        })
    });

    const data = await response.json();
    if (data.error) {
        return alert(data.message);
    };

    session.username = data.user.login;
    session.password = password;

    document.getElementById("login").style.display = "none";
    document.getElementById("dashboard").classList.remove("hidden");
    document.getElementById("displayName").innerText = data.user.login === data.user.name.toLowerCase() ? data.user.name : data.user.login;

    loadShorts();
};

export { session, login };