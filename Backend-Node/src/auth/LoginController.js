const express = require("express");
const router = express.Router();
const prisma = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// POST /login
router.post("/", async (req, res) => {
  try {
    // console.log(req)
    const { email, password } = req.body;

    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!user.password) {
      return res.status(400).json({ message: "Password not set." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(403).json({ message: "Wrong password." });
    }
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role,
    };
    const secret = process.env.JWT_SECRET;

    const expiresIn = 60 * 60 * 1;

    const token = jwt.sign(payload, secret, { expiresIn: expiresIn });
    return res.json({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
      },
      access_token: token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

module.exports = router;
