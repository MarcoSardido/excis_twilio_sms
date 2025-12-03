// auth/passport.js
import dotenv from "dotenv";
dotenv.config(); // ensure environment variables are loaded

import { Strategy as OpenIDConnectStrategy } from "passport-openidconnect";

export const setupPassport = (passport) => {
  const {
    KEYCLOAK_BASE_URL,
    KEYCLOAK_REALM,
    KEYCLOAK_CLIENT_ID,
    KEYCLOAK_CLIENT_SECRET,
    BACKEND_BASE_URL,
  } = process.env;

  if (!KEYCLOAK_BASE_URL || !KEYCLOAK_REALM || !KEYCLOAK_CLIENT_ID || !KEYCLOAK_CLIENT_SECRET || !BACKEND_BASE_URL) {
    throw new Error("Missing required Keycloak environment variables. Please check your .env file.");
  }

  const authorizationURL = `${KEYCLOAK_BASE_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/auth`;
  const tokenURL = `${KEYCLOAK_BASE_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`;
  const userInfoURL = `${KEYCLOAK_BASE_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/userinfo`;
  const callbackURL = `${BACKEND_BASE_URL}/auth/callback`;

  passport.use(
    "openidconnect",
    new OpenIDConnectStrategy(
      {
        issuer: `${KEYCLOAK_BASE_URL}/realms/${KEYCLOAK_REALM}`,
        authorizationURL,
        tokenURL,
        userInfoURL,
        clientID: KEYCLOAK_CLIENT_ID,
        clientSecret: KEYCLOAK_CLIENT_SECRET,
        callbackURL,
        scope: "openid profile email",
      },
      function (issuer, sub, profile, accessToken, refreshToken, params, done) {
        const user = {
          id: sub,
          profile,
          accessToken,
          refreshToken,
          idToken: params?.id_token,
        };
        return done(null, user);
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, { id: user.id, profile: user.profile, idToken: user.idToken });
  });

  passport.deserializeUser((obj, done) => {
    done(null, obj);
  });
};
