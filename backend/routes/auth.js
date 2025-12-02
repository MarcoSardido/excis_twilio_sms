// routes/auth.js
import express from "express";
import passport from "passport";

const router = express.Router();

// Kick off login
router.get("/auth/login", passport.authenticate("openidconnect"));

// Callback from Keycloak
router.get(
  "/auth/callback",
  passport.authenticate("openidconnect", {
    failureRedirect: "/twilio-sms-web/auth/failure", // keep full path here so Keycloak redirects correctly
    session: true,
  }),
  (req, res) => {
    const frontend = process.env.FRONTEND_BASE_URL || "http://localhost:3000";
    res.redirect(frontend + "/#/inbox");
  }
);

// Failure route
router.get("/auth/failure", (req, res) => {
  res.status(401).send("Authentication failed");
});

// Logout
router.get("/auth/logout", (req, res) => {
  const {
    KEYCLOAK_BASE_URL,
    KEYCLOAK_REALM,
    BACKEND_BASE_URL,
  } = process.env;

  const idToken = req.user?.idToken;

  req.logout(() => {
    req.session.destroy(() => {
      // Build redirect after logout
      const postLogoutRedirect = `${BACKEND_BASE_URL}/auth/login`;

      // Build logout URL (automatic logout, no confirmation)
      let logoutUrl = `${KEYCLOAK_BASE_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/logout`;
      logoutUrl += `?redirect_uri=${encodeURIComponent(postLogoutRedirect)}`;

      if (idToken) {
        logoutUrl += `&id_token_hint=${encodeURIComponent(idToken)}`;
      }

      res.redirect(logoutUrl);
    });
  });
});


export default router;
