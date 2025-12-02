// index.js
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

const {
  BACKEND_BASE_URL,
  FRONTEND_BASE_URL,
  SESSION_SECRET,
} = process.env;

const app = express();

app.use(morgan("dev"));
app.use(cookieParser());

// CORS: allow frontend to call backend with credentials
app.use(
  cors({
    origin: FRONTEND_BASE_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      // secure: true in production with HTTPS
    },
  })
);

// init passport
app.use(passport.initialize());
app.use(passport.session());

setupPassport(passport); // configure strategy and serialize/deserialize

// routes
app.use("/twilio-sms-web", authRoutes);
app.use("/twilio-sms-web/api", apiRoutes);

// simple health
app.get("/ping", (_, res) => res.json({ ok: true }));

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Backend listening on ${port}`);
});
