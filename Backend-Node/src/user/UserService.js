const getCurrentUser = (req, res) => {
  if (!req.userData) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  return res.status(200).json({
    success: true,
    data: req.userData,
  });
};

module.exports = { getCurrentUser };
