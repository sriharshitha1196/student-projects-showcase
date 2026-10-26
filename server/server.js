require("dotenv").config();

const express = require("express");
const session = require("express-session");
const path = require("path");
const db = require("./database");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: false }));

app.use(
    session({
        name: "showcase.sid",
        secret: process.env.SESSION_SECRET || "local-development-only-secret",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: 2 * 60 * 60 * 1000
        }
    })
);

app.use(express.static(path.join(__dirname, "../client")));

function validWebUrl(value) {
    try {
        const url = new URL(value);
        return (
            url.protocol === "https:" &&
            Boolean(url.hostname) &&
            !url.username &&
            !url.password
        );
    } catch {
        return false;
    }
}

function requireAdmin(req, res, next) {
    if (!req.session.isAdmin) {
        return res.status(401).json({ error: "Admin login required." });
    }
    next();
}

// Public feed: approved projects only
app.get("/api/projects", (req, res) => {
    const projects = db.prepare(`
    SELECT id, title, student_name, description, tags,
           github_url, demo_url, created_at
    FROM projects
    WHERE status = 'Approved'
    ORDER BY created_at DESC
  `).all();

    res.json(projects);
});

// Public project submission
app.post("/api/projects", (req, res) => {
    const { title, student_name, description, tags, github_url, demo_url } =
        req.body || {};

    const fields = [title, student_name, description, tags, github_url, demo_url];

    if (
        fields.some(value => typeof value !== "string" || !value.trim()) ||
        title.trim().length > 120 ||
        student_name.trim().length > 100 ||
        description.trim().length > 2000 ||
        tags.trim().length > 250 ||
        !validWebUrl(github_url.trim()) ||
        !validWebUrl(demo_url.trim()) ||
        !new URL(github_url.trim()).hostname.toLowerCase().endsWith("github.com")
    ) {
        return res.status(400).json({
            error: "Enter all fields correctly, including a valid HTTPS GitHub URL and demo URL."
        });
    }

    const result = db.prepare(`
    INSERT INTO projects
      (title, student_name, description, tags, github_url, demo_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
        title.trim(),
        student_name.trim(),
        description.trim(),
        tags.trim(),
        github_url.trim(),
        demo_url.trim()
    );

    res.status(201).json({
        message: "Submission received. It will appear publicly after admin approval.",
        id: result.lastInsertRowid,
        status: "Pending"
    });
});

// Admin login
app.post("/api/admin/login", (req, res) => {
    const { username, password } = req.body || {};

    if (
        !process.env.ADMIN_USERNAME ||
        !process.env.ADMIN_PASSWORD ||
        !process.env.SESSION_SECRET
    ) {
        return res.status(503).json({
            error: "Configure ADMIN_USERNAME, ADMIN_PASSWORD and SESSION_SECRET in server/.env first."
        });
    }

    if (
        typeof username !== "string" ||
        typeof password !== "string" ||
        username !== process.env.ADMIN_USERNAME ||
        password !== process.env.ADMIN_PASSWORD
    ) {
        return res.status(401).json({ error: "Invalid username or password." });
    }

    req.session.regenerate(err => {
        if (err) {
            return res.status(500).json({ error: "Could not start admin session." });
        }

        req.session.isAdmin = true;
        res.json({ message: "Admin login successful." });
    });
});

// Admin logout
app.post("/api/admin/logout", requireAdmin, (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: "Could not log out." });
        }

        res.clearCookie("showcase.sid");
        res.json({ message: "Logged out successfully." });
    });
});

// Admin: list submissions, optionally filter by status
app.get("/api/admin/projects", requireAdmin, (req, res) => {
    const status = req.query.status;
    const allowed = ["Pending", "Approved", "Rejected"];

    if (status && !allowed.includes(status)) {
        return res.status(400).json({ error: "Invalid status filter." });
    }

    const projects = status
        ? db.prepare(`
        SELECT * FROM projects WHERE status = ? ORDER BY created_at DESC
      `).all(status)
        : db.prepare(`
        SELECT * FROM projects ORDER BY created_at DESC
      `).all();

    res.json(projects);
});

// Admin: approve or reject a submission
app.patch("/api/admin/projects/:id", requireAdmin, (req, res) => {
    const id = Number(req.params.id);
    const { status } = req.body || {};

    if (!Number.isSafeInteger(id) || id < 1) {
        return res.status(400).json({ error: "Invalid project ID." });
    }

    if (!["Approved", "Rejected"].includes(status)) {
        return res.status(400).json({
            error: "Status must be Approved or Rejected."
        });
    }

    const result = db.prepare(`
    UPDATE projects
    SET status = ?, reviewed_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(status, id);

    if (result.changes === 0) {
        return res.status(404).json({ error: "Project not found." });
    }

    res.json({ message: `Project ${status.toLowerCase()} successfully.` });
});

app.listen(PORT, () => {
    console.log(`Student Project Showcase running at http://localhost:${PORT}`);
});