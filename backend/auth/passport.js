// auth/passport.js
import { Strategy as OpenIDConnectStrategy } from "passport-openidconnect";

export const setupPassport = (passport) => {
  const {
    KEYCLOAK_BASE_URL,
    KEYCLOAK_REALM,
    KEYCLOAK_CLIENT_ID,
    KEYCLOAK_CLIENT_SECRET,
    BACKEND_BASE_URL,
  } = process.env;

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
        // profile may be empty; create a user object from tokens or userinfo
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
    console.log("serializeUser", user);
    // store minimal info in session
    done(null, { id: user.id, profile: user.profile, idToken: user.idToken });
  });

  passport.deserializeUser((obj, done) => {
    done(null, obj);
  });
};
