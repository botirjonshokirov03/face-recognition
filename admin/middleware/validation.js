const loginValidation = (req, res, next) => {
  const { email } = req.body;
  const file = req.file;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  if (!file || !file.buffer) {
    return res.status(400).json({ error: "Image is required" });
  }

  next();
};

module.exports = { loginValidation };
