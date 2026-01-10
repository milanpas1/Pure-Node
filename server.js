const http = require("http");
const url = require("url");
const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "users.json");

// ---------- Load users from file ----------
let users = [];
let nextId = 1;

function loadUsers() {
  try {
    const data = fs.readFileSync(DATA_FILE, "utf-8");
    users = JSON.parse(data);
    nextId = users.reduce((max, u) => Math.max(max, u.id), 0) + 1;
  } catch {
    users = [];
    nextId = 1;
  }
}

function saveUsers() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
}

loadUsers();

// ---------- Server ----------
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathName = parsedUrl.pathname;
  const method = req.method;

  console.log(method, pathName);

  // GET /users
  if (pathName === "/users" && method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(users));
  }

  // POST /users
  if (pathName === "/users" && method === "POST") {
    let body = "";

    req.on("data", chunk => (body += chunk.toString()));

    req.on("end", () => {
      if (!body) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Empty body" }));
      }

      try {
        const data = JSON.parse(body);

        if (!data.name || !data.email) {
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ error: "name and email required" }));
        }

        const user = {
          id: nextId++,
          name: data.name,
          email: data.email
        };

        users.push(user);
        saveUsers();

        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify(user));
      } catch {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON" }));
      }
    });

    return;
  }

  // GET /users/:id
  if (pathName.startsWith("/users/") && method === "GET") {
    const id = Number(pathName.split("/")[2]);

    if (isNaN(id)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Invalid ID" }));
    }

    const user = users.find(u => u.id === id);

    if (!user) {
      res.writeHead(404, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "User not found" }));
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(user));
  }

  // DELETE /users/:id
  if (pathName.startsWith("/users/") && method === "DELETE") {
    const id = Number(pathName.split("/")[2]);

    const index = users.findIndex(u => u.id === id);
    if (index === -1) {
      res.writeHead(404, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "User not found" }));
    }

    users.splice(index, 1);
    saveUsers();

    res.writeHead(204);
    return res.end();
  }

  // Fallback
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Route not found" }));
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
