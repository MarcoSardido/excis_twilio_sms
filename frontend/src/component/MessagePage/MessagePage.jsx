import { useEffect, useState } from "react";
import { Layout } from "../Layout/Layout";
import { getTwilioMessage } from "../../js/getTwilioMessages";
import { useNavigate, useParams } from "react-router-dom";
import { MessageInfo } from "../MessageInfo/MessageInfo";
import { LoadingOutlined } from "@ant-design/icons";
import { ErrorLabel } from "../ErrorLabel/ErrorLabel";
import { useAuthentication } from "../../context/AuthenticationProvider";
import PropTypes from "prop-types";

/**
 * @typedef {import("../../js/types").Message} Message
 */

const MessagePanel = ({ message }) => {
  const navigate = useNavigate();
  const isReceived = message.direction === "received";
  const isSent = message.direction === "sent";

  return (
    <>
      <MessageInfo message={message} />
      <div className="mt-4 text-right space-x-4">
        <button
          onClick={() =>
            navigate(`/conversation/${message.from}/${message.to}`)
          }
        >
          See Conversation
        </button>
        {isReceived && (
          <button
            onClick={() =>
              navigate(`/send/${message.to}/${message.from}`)
            }
          >
            Reply
          </button>
        )}
        {isSent && (
          <button
            onClick={() =>
              navigate(`/send/${message.from}/${message.to}`)
            }
          >
            New Message
          </button>
        )}
      </div>
    </>
  );
};

// ✅ Add PropTypes validation for MessagePanel
MessagePanel.propTypes = {
  message: PropTypes.shape({
    direction: PropTypes.string.isRequired,
    from: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired,
    body: PropTypes.string,
    status: PropTypes.string,
    date: PropTypes.string,
    hasMedia: PropTypes.bool,
  }).isRequired,
};

export const MessagePage = () => {
  const { messageSid } = useParams();
  const { authentication, loading: authLoading } = useAuthentication();
  const [message, setMessage] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authLoading && authentication) {
      setLoading(true);
      setError(null);

      getTwilioMessage(messageSid)
        .then(setMessage)
        .catch(err => {
          const errorMessage =
            err instanceof Error ? err.message : "Unable to fetch message";
          setError(errorMessage);
        })
        .finally(() => setLoading(false));
    }
  }, [authLoading, authentication, messageSid]);

  if (authLoading || loading) {
    return (
      <Layout>
        <p className="text-center text-gray-500 mt-10 text-xl">
          <LoadingOutlined spin className="mr-2" /> Loading...
        </p>
      </Layout>
    );
  }

  return (
    <Layout>
      <h3>Message</h3>
      <ErrorLabel error={error} />
      <p className="my-4">More details for your message.</p>
      {!error && <MessagePanel message={message} />}
    </Layout>
  );
};
