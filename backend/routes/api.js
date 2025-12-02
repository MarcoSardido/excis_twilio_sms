// routes/api.js
import express from "express";

const router = express.Router();

// simple auth check middleware
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  return res.status(401).json({ error: "unauthenticated" });
};

router.get("/me", ensureAuthenticated, (req, res) => {
  res.json({ user: req.user });
});

export default router;
