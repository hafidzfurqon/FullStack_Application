const express = require("express");
const router = express.Router();
const { getCurrentUser } = require("./UserService");

router.get("/", getCurrentUser);

module.exports = router;
