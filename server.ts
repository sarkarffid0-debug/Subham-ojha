import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const PORT = 3000;
const LINKS_FILE = path.join(process.cwd(), "data", "links.json");
const CONFIG_FILE = path.join(process.cwd(), "data", "config.json");

// Helper to read links
function readLinks(): any[] {
  try {
    if (fs.existsSync(LINKS_FILE)) {
      const data = fs.readFileSync(LINKS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading links file:", err);
  }
  return [];
}

// Helper to write links
function writeLinks(links: any[]): boolean {
  try {
    const dir = path.dirname(LINKS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LINKS_FILE, JSON.stringify(links, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error writing links file:", err);
    return false;
  }
}

// Helper to read config (admin password)
function readConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading config file:", err);
  }
  return { adminPassword: "admin" };
}

// Helper to write config
function writeConfig(config: any): boolean {
  try {
    const dir = path.dirname(CONFIG_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error writing config file:", err);
    return false;
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // CORS headers for local development if needed
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // Admin authorization middleware
  const authorizeAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Authorization header is required." });
    }

    const config = readConfig();
    if (authHeader !== config.adminPassword) {
      return res.status(401).json({ error: "Invalid admin password." });
    }
    next();
  };

  // --- API ROUTES ---

  // Get all study links
  app.get("/api/links", (req, res) => {
    const links = readLinks();
    res.json(links);
  });

  // Add a new link
  app.post("/api/links", authorizeAdmin, (req, res) => {
    const { title, subject, url, description } = req.body;
    if (!title || !subject || !url) {
      return res.status(400).json({ error: "Title, Subject, and URL are required." });
    }

    // Ensure valid subject
    const validSubjects = ["ENGLISH", "MATH", "HINDI", "ODIA", "HISTORY", "SCIENCE"];
    if (!validSubjects.includes(subject.toUpperCase())) {
      return res.status(400).json({ error: "Invalid subject category." });
    }

    const links = readLinks();
    const newLink = {
      id: "link-" + Date.now(),
      title,
      subject: subject.toUpperCase(),
      url,
      description: description || ""
    };

    links.push(newLink);
    if (writeLinks(links)) {
      res.status(201).json(newLink);
    } else {
      res.status(500).json({ error: "Failed to write data." });
    }
  });

  // Update a link
  app.put("/api/links/:id", authorizeAdmin, (req, res) => {
    const { id } = req.params;
    const { title, subject, url, description } = req.body;

    const links = readLinks();
    const index = links.findIndex(l => l.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Link not found." });
    }

    if (subject) {
      const validSubjects = ["ENGLISH", "MATH", "HINDI", "ODIA", "HISTORY", "SCIENCE"];
      if (!validSubjects.includes(subject.toUpperCase())) {
        return res.status(400).json({ error: "Invalid subject category." });
      }
      links[index].subject = subject.toUpperCase();
    }

    if (title) links[index].title = title;
    if (url) links[index].url = url;
    if (description !== undefined) links[index].description = description;

    if (writeLinks(links)) {
      res.json(links[index]);
    } else {
      res.status(500).json({ error: "Failed to update data." });
    }
  });

  // Delete a link
  app.delete("/api/links/:id", authorizeAdmin, (req, res) => {
    const { id } = req.params;
    const links = readLinks();
    const filtered = links.filter(l => l.id !== id);

    if (links.length === filtered.length) {
      return res.status(404).json({ error: "Link not found." });
    }

    if (writeLinks(filtered)) {
      res.json({ message: "Link deleted successfully.", id });
    } else {
      res.status(500).json({ error: "Failed to delete link." });
    }
  });

  // Admin login check
  app.post("/api/admin/login", (req, res) => {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: "Password is required." });
    }

    const config = readConfig();
    if (password === config.adminPassword) {
      res.json({ success: true, message: "Logged in successfully." });
    } else {
      res.status(401).json({ error: "Invalid credentials." });
    }
  });

  // Admin change password
  app.post("/api/admin/change-password", authorizeAdmin, (req, res) => {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.trim().length < 4) {
      return res.status(400).json({ error: "New password must be at least 4 characters." });
    }

    const config = readConfig();
    config.adminPassword = newPassword;
    if (writeConfig(config)) {
      res.json({ success: true, message: "Password updated successfully." });
    } else {
      res.status(500).json({ error: "Failed to save new password." });
    }
  });

  // --- VITE INTERFACE / FRONTEND HANDLING ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Study Notes Hub running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Error starting server:", err);
});
