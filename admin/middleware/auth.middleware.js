const jwt = require("jsonwebtoken");
const User = require("../models/User");

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: "Not authorized" });
    }

    req.admin = user;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid token" });
  }
};

module.exports = { verifyToken };
