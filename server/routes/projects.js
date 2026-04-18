const express = require("express");
const archiver = require("archiver");
const db = require("../db");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.use(authMiddleware);

router.get("/me", (req, res) => {
  db.all(
    "SELECT id, name, updated_at FROM projects WHERE user_id = ? ORDER BY updated_at DESC",
    [req.user.id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ message: "Failed to fetch projects" });
      }
      return res.status(200).json({ projects: rows || [] });
    },
  );
});

router.get("/:id", (req, res) => {
  db.get(
    "SELECT id, name, html, css, js, updated_at FROM projects WHERE id = ? AND user_id = ?",
    [req.params.id, req.user.id],
    (err, row) => {
      if (err) {
        return res.status(500).json({ message: "Failed to fetch project" });
      }
      if (!row) {
        return res.status(404).json({ message: "Project not found" });
      }
      return res.status(200).json({ project: row });
    },
  );
});

router.post("/save", (req, res) => {
  const { projectId, name, html = "", css = "", js = "" } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Project name is required" });
  }

  if (projectId) {
    db.run(
      "UPDATE projects SET name = ?, html = ?, css = ?, js = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?",
      [name.trim(), html, css, js, projectId, req.user.id],
      function onUpdate(err) {
        if (err) {
          return res.status(500).json({ message: "Failed to update project" });
        }
        if (this.changes === 0) {
          return res.status(404).json({ message: "Project not found" });
        }
        return res
          .status(200)
          .json({ message: "Project updated", projectId: Number(projectId) });
      },
    );
    return;
  }

  db.run(
    "INSERT INTO projects (user_id, name, html, css, js) VALUES (?, ?, ?, ?, ?)",
    [req.user.id, name.trim(), html, css, js],
    function onInsert(err) {
      if (err) {
        return res.status(500).json({ message: "Failed to save project" });
      }
      return res
        .status(201)
        .json({ message: "Project saved", projectId: this.lastID });
    },
  );
});

router.get("/:id/download", (req, res) => {
  db.get(
    "SELECT id, name, html, css, js FROM projects WHERE id = ? AND user_id = ?",
    [req.params.id, req.user.id],
    (err, row) => {
      if (err) {
        return res.status(500).json({ message: "Failed to create zip" });
      }
      if (!row) {
        return res.status(404).json({ message: "Project not found" });
      }

      const safeName = row.name.replace(/[^a-zA-Z0-9_-]/g, "_") || "project";
      const htmlFile = `<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <title>${safeName}</title>\n  <link rel="stylesheet" href="styles.css" />\n</head>\n<body>\n${row.html}\n<script src="script.js"></script>\n</body>\n</html>\n`;

      res.setHeader("Content-Type", "application/zip");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${safeName}.zip`,
      );

      const archive = archiver("zip", { zlib: { level: 9 } });
      archive.on("error", () => {
        if (!res.headersSent) {
          res.status(500).json({ message: "Failed to generate zip" });
        }
      });

      archive.pipe(res);
      archive.append(htmlFile, { name: "index.html" });
      archive.append(row.css || "", { name: "styles.css" });
      archive.append(row.js || "", { name: "script.js" });
      archive.finalize();
    },
  );
});

module.exports = router;
