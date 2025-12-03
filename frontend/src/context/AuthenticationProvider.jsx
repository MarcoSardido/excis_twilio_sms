import PropTypes from "prop-types";
import { createContext, useContext, useState, useEffect } from "react";

// Create context with default values
const AuthenticationContext = createContext({
  authentication: null,
  loading: true,
});

export const AuthenticationProvider = ({ children }) => {
  const [authentication, setAuthentication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuthentication = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_PRODUCTION_URL || "http://localhost:3001"}/twilio-sms-web/api/me`,
          { credentials: "include" }
        );

        if (res.ok) {
          const data = await res.json();
          setAuthentication(data.user);
        } else {
          setAuthentication(null);
        }
      } catch (err) {
        console.error("Failed to fetch authentication:", err);
        setAuthentication(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAuthentication();
  }, []);

  return (
    <AuthenticationContext.Provider value={{ authentication, loading }}>
      {children}
    </AuthenticationContext.Provider>
  );
};

AuthenticationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Hook to use authentication inside components
export const useAuthentication = () => useContext(AuthenticationContext);

// ✅ Optional: a reusable custom hook that returns only authentication
export const useCurrentAuthentication = () => {
  const { authentication } = useContext(AuthenticationContext);
  return authentication;
};
