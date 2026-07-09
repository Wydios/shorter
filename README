# 🚀 Shorter

**Safe and Simple URL Shortener :)**

Shorter is a modern URL shortener built with TypeScript, Express and MariaDB.
It provides a web interface, API access and a simple way to manage your short links.

---

## ✨ Features

* 🔗 Create short URLs
* 👤 User based access
* 📊 Click tracking
* 🌐 Web dashboard
* 🤖 API support for bots and external tools
* ⚡ Fast Express backend
* 🗄️ MariaDB database support

---

# 📦 Installation

## 1. Clone the repository

```bash
git clone https://github.com/Wydios/shorter.git
```

Go into the folder:

```bash
cd shorter
```

---

## 2. Install dependencies

```bash
npm install
```

---

# ⚙️ Configuration

Go to:

```
app/server/config/
```

Rename:

```
exampleConfig.ts
```

to:

```
config.ts
```

Then open `config.ts` and add your own configuration

---

# 🗄️ Database Setup

Create a MariaDB/MySQL database:

```sql
CREATE DATABASE shorter;
```

The required database tables can be found here:

```
db-schema.sql
```

Import the schema into your database before starting Shorter.

---

# ▶️ Running

## Development

For development and testing:

```bash
npm run dev
```

This starts Shorter with automatic TypeScript reload.

---

## Production Server

For running Shorter with PM2:

```bash
npm run pm2:start
```

Restart:

```bash
npm run pm2:restart
```

Stop:

```bash
npm run pm2:stop
```

---

# 🎨 Customize Website

The frontend is located at:

```
app/website/
```

## Change Name

Open:

```
app/website/index.html
```

Search for:

```html
Wydios Shorter
```

Replace it with your own project name.

Example:

```html
My Awesome Shortener 🚀
```

---

## Change Favicon

Replace:

```
app/website/assets/images/favicon.ico
```

with your own favicon.

---

# 🤖 API Usage

Create a Short URL:

```http
POST /documents
```

Headers:

```http
Authorization: Bearer Penis
Content-Type: application/json
```

Body:

```json
{
    "username": "USERNAME",
    "url": "https://example.com",
    "days": 7
}
```

Example response:

```json
{
    "error": false,
    "message": "Here is your Short created :)",
    "short": {
        "code": "abc12",
        "url": "https://s.example.com/abc12",
        "target": "https://example.com",
        "expires": "2026-07-9T12:00:00.000Z"
    }
}
```

---

# 💙 Credits

Created with ❤️ by **Wydios**
Hope you enjoy using that Project