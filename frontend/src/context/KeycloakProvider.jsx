import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import keycloak from "../keycloak";

export const KeycloakContext = React.createContext(null);

export const KeycloakProvider = ({ children }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Prevent Keycloak double initialization (HMR, hot reload)
    if (!keycloak.__initialized) {
      keycloak.__initialized = true;

      keycloak
        .init({
          onLoad: "login-required",
          checkLoginIframe: false,
          pkceMethod: "S256",
          responseMode: "query",
        })
        .then((authenticated) => {
          if (!isMounted) return;

          if (!authenticated) {
            keycloak.login();
            return;
          }

          setIsReady(true);

          // Auto refresh token every 10s
          keycloak._refreshInterval = setInterval(() => {
            keycloak.updateToken(30).catch(() => keycloak.login());
          }, 10000);
        })
        .catch((err) => {
          console.error("Keycloak init failed:", err);
        });
    } else {
      // Already initialized (because of HMR), just mark ready
      setIsReady(true);
    }

    return () => {
      isMounted = false;

      // Do NOT clear refresh interval — HMR will break refresh otherwise
      // Only clear it on FULL reload
    };
  }, []);

  if (!isReady) {
    return <div className="p-4">Initializing login…</div>;
  }

  return (
    <KeycloakContext.Provider value={{ keycloak }}>
      {children}
    </KeycloakContext.Provider>
  );
};

KeycloakProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
