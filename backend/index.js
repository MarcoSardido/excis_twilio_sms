import express from "express";
import session from "express-session";
import passport from "passport";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import { setupPassport } from "./auth/passport.js";
import authRoutes from "./routes/auth.js";
import apiRoutes from "./routes/api.js";

dotenv.config();

const { BACKEND_BASE_URL, FRONTEND_BASE_URL, SESSION_SECRET } = process.env;

const app = express();

// Logging & parsers
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());

// CORS (allow frontend to send credentials)
app.use(
  cors({
    origin: FRONTEND_BASE_URL, // e.g., http://localhost:3000
    credentials: true,
  })
);

// Session + Passport
app.use(
  session({
    secret: SESSION_SECRET || "supersecret",
    resave: false,
    saveUninitialized: false, // must be true to create session for login
    cookie: {
      httpOnly: true,
      secure: false, // true in production with HTTPS
      sameSite: "lax", // "none" requires secure:true
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
setupPassport(passport); // configure OpenID Connect (Keycloak)

// Routes
app.use("/twilio-sms-web", authRoutes);
app.use("/twilio-sms-web/api", apiRoutes);

// Health check
app.get("/ping", (_, res) => res.json({ ok: true }));

// Start server
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Backend listening on ${port}`);
});
