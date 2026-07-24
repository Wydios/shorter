import { session } from "./auth.js";

function copyShort(code) {
    const url = `https://s.wydios.de/${code}`;

    navigator.clipboard.writeText(url);

    alert("Copied to Clipboard!");
};

export async function createShort() {
    const url = document.getElementById("url").value.trim();
    if (!url) {
        return alert("Please enter a URL");
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
        return alert(data.message);
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
    if (!confirm(`Delete short "${code}"?\nThe link will stop working immediately`)) return;
    
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
        return alert(data.message);
    };

    alert(`Short with code ${code} has been deleted`);

    loadShorts();
};

export async function loadShorts(currentCode = null) {
    if (!session.username || !session.password) return;

    const response = await fetch("/me", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.password}`
        },
        body: JSON.stringify({
            username: session.username
        })
    });

    const data = await response.json();
    if (data.error) {
        return console.error(data.message);
    };

    const shortList = document.getElementById("shortList");
    shortList.innerHTML = "";

    if (!data.shorts.length) {
        return shortList.innerHTML = `
            <p class="info">
                You don't have any shorts yet.
            </p>
        `;
    };

    const rankedShorts = [...data.shorts].sort((a, b) => b.clicks - a.clicks);
    const ranks = new Map(rankedShorts.map((short, index) => [short.code, index]));

    data.shorts.forEach((short) => {
        let rank = "";

        switch (ranks.get(short.code)) {
            case 0:
                rank = "🥇";
                break;
            case 1:
                rank = "🥈";
                break;
            case 2:
                rank = "🥉";
                break;
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

            <button class="cool-button copy-button">
                <span>Copy</span>
            </button>

            <button class="delete-button delete-short-button">
                <span>Delete</span>
            </button>
        `;

        const copyButton = div.querySelector(".copy-button");
        copyButton.addEventListener("click", () => copyShort(short.code));
                    
        const deleteButton = div.querySelector(".delete-short-button");
        deleteButton.addEventListener("click", () => deleteShort(short.code));

        shortList.appendChild(div);
    });
};