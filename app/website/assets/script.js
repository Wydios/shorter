let session = {
    username: null,
    password: null
};

function copyShort(code) {
    const url = `https://s.wydios.de/${code}`;

    navigator.clipboard.writeText(url);

    alert("Copied");
};

async function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    if (!username || !password) {
        alert("Please enter username and password");
        return;
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
        alert(data.message);
        return;
    };

    session.username = username;
    session.password = password;

    document.getElementById("login").style.display = "none";
    document.getElementById("dashboard").classList.remove("hidden");
    document.getElementById("displayName").innerText = data.user.username;

    loadShorts();
};

async function createShort() {
    const url = document.getElementById("url").value.trim();

    if (!url) {
        alert("Please enter a URL");
        return;
    };

    const response = await fetch("/documents", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.password}`
        },
        body: JSON.stringify({
            username: session.username,
            url,
            days: 7
        })
    });

    const data = await response.json();
    if (data.error) {
        alert(data.message);
        return;
    };

    document.getElementById("url").value = "";

    if (data.short) {
        const shortUrl = `https://s.wydios.de/${data.short.code}`;

        await navigator.clipboard.writeText(shortUrl);

        alert("Short created and copied to clipboard");
    }

    loadShorts(data.short.code);
};

async function deleteShort(code) {
    const confirmDelete = confirm(`Delete short "${code}"?\nThe link will stop working immediately`);
    if (!confirmDelete) return;

    const response = await fetch("/me", {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.password}`
        },
        body: JSON.stringify({
            username: session.username,
            code: code
        })
    });

    const data = await response.json();
    if (data.error) {
        alert(data.message);
        return;
    };

    alert(`Short with code ${code} has been deleted`);

    loadShorts();
};

async function loadShorts(currentCode = null) {
    const username = session.username;
    if (!username) {
        console.error("No user logged in");
        return;
    };

    const response = await fetch("/me", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.password}`
        },
        body: JSON.stringify({
            username: username
        })
    });

    const data = await response.json();
    if (data.error) {
        console.error(data.message);
        return;
    };

    const shortList = document.getElementById("shortList");
    shortList.innerHTML = "";

    if (data.shorts.length === 0) {
        shortList.innerHTML = `
            <p class="info">
                You don't have any shorts yet
            </p>
        `;

        return;
    };

    const sortedShorts = data.shorts.sort((a, b) => {
        return b.clicks - a.clicks;
    });

    sortedShorts.forEach((short, index) => {
        let rank = "";

        if (index === 0) {
            rank = "🥇";
        } else if (index === 1) {
            rank = "🥈";
        } else if (index === 2) {
            rank = "🥉";
        }

        const isCurrent = short.code === currentCode;

        const div = document.createElement("div");
        div.className = "short";

        div.innerHTML = `
            ${isCurrent ? `
                <p>
                    🆕 <b>New Short</b> 🆕
                </p>
            ` : ""}

            <p>
                ${rank ? rank + " - " : ""}Code:
                <b>${short.code}</b>
            </p>

            <p>
                📍 Target:
                ${short.target.slice(0, 25)}${short.target.length > 25 ? "..." : ""}
            </p>

            <p>
                ⏳ Expires:
                ${new Date(short.expires_at).toLocaleDateString()}
            </p>

            <p>
                🔥 Clicks:
                ${short.clicks}
            </p>

            <button class="cool-button" onclick="copyShort('${short.code}')">
                <span>Copy</span>
            </button>

            <button class="delete-button" onclick="deleteShort('${short.code}')">
                <span>Delete</span>
            </button>
        `;

        shortList.appendChild(div);
    });
};