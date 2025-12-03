// backend/auth/auth.js
import passport from "passport";
import session from "express-session";
import { setupPassport } from "./passport.js";

setupPassport(passport);

// Configure Express session
export const initAuth = (app) => {
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "supersecret",
      resave: false,
      saveUninitialized: true,
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());
};

// Middleware to ensure user is authenticated
export const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Unauthorized" });
};
