const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "replace_me_with_env_secret";

function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: "7d" },
  );
}

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Name, email, and password are required" });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    db.run(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      [name.trim(), email.trim().toLowerCase(), hash],
      function onInsert(err) {
        if (err) {
          if (String(err.message).includes("UNIQUE")) {
            return res
              .status(409)
              .json({ message: "Email is already registered" });
          }
          return res.status(500).json({ message: "Failed to register user" });
        }

        const user = {
          id: this.lastID,
          name: name.trim(),
          email: email.trim().toLowerCase(),
        };

        const token = signToken(user);
        return res.status(201).json({ token, user });
      },
    );
  } catch (error) {
    return res.status(500).json({ message: "Failed to process registration" });
  }
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  db.get(
    "SELECT id, name, email, password_hash FROM users WHERE email = ?",
    [email.trim().toLowerCase()],
    async (err, row) => {
      if (err) {
        return res.status(500).json({ message: "Failed to login" });
      }
      if (!row) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const valid = await bcrypt.compare(password, row.password_hash);
      if (!valid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const user = {
        id: row.id,
        name: row.name,
        email: row.email,
      };

      const token = signToken(user);
      return res.status(200).json({ token, user });
    },
  );
});

router.post("/forgot-password", async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res
      .status(400)
      .json({ message: "Email and new password are required" });
  }

  if (newPassword.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  try {
    const hash = await bcrypt.hash(newPassword, 10);
    db.run(
      "UPDATE users SET password_hash = ? WHERE email = ?",
      [hash, email.trim().toLowerCase()],
      function onUpdate(err) {
        if (err) {
          return res.status(500).json({ message: "Failed to reset password" });
        }

        if (this.changes === 0) {
          return res
            .status(404)
            .json({ message: "No account found with this email" });
        }

        return res.status(200).json({ message: "Password reset successful" });
      },
    );
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to process password reset" });
  }
});

module.exports = router;
