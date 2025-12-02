import { useEffect, useState } from "react";
import PropTypes from "prop-types";

export const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // check user session from backend
    fetch("http://localhost:3001/twilio-sms-web/api/me", {
      credentials: "include",
    })
      .then((res) => {
        if (res.status === 200) return res.json();
        throw new Error("Not authenticated");
      })
      .then(() => {
        setAuthenticated(true);
        setLoading(false);
      })
      .catch(() => {
        window.location.href =
          "http://localhost:3001/twilio-sms-web/auth/login";
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!authenticated) return null;

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};
