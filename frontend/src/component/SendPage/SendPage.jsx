import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthentication } from "../../context/AuthenticationProvider";
import { getTwilioPhoneNumbers } from "../../js/getTwilioPhoneNumbers";
import { sendTwilioMessage } from "../../js/sendTwilioMessage";
import { phonePattern } from "../../js/util";
import { Layout } from "../Layout/Layout";
import { PhoneCombobox } from "../PhoneCombobox/PhoneComboox";
import { ErrorLabel } from "../ErrorLabel/ErrorLabel";
import { Loading3QuartersOutlined } from "@ant-design/icons";

export const SendPage = () => {
  const { from: fromParam, to: toParam } = useParams();
  const navigate = useNavigate();
  const { authentication, loading: authLoading } = useAuthentication();

  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [from, setFrom] = useState(fromParam ?? "");
  const [to, setTo] = useState(toParam ?? "");
  const [message, setMessage] = useState("");
  const [loadingPhoneNumbers, setLoadingPhoneNumbers] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState(null);

  // Load Twilio phone numbers after authentication
  useEffect(() => {
    if (!authLoading && authentication) {
      getTwilioPhoneNumbers()
        .then(setPhoneNumbers)
        .catch(setError)
        .finally(() => setLoadingPhoneNumbers(false));
    }
  }, [authLoading, authentication]);

  const handleToOnChange = e => {
    const val = e.target.value;
    setTo("+" + val.replace(/\D/g, ""));
  };

  const handleSend = async () => {
    if (!authentication || sendingMessage) return;

    setSendingMessage(true);
    setError(null);

    try {
      const messageSid = await sendTwilioMessage(authentication, to, from, message);
      navigate(`/sent/${messageSid}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unable to send message";
      setError(errorMessage);
    } finally {
      setSendingMessage(false);
    }
  };

  const isValid = useMemo(() => {
    const isValidFrom = phoneNumbers.includes(from);
    const isValidTo = to.match(phonePattern) !== null;
    const isValidMessage = message.length > 0 && message.length <= 500;
    return !sendingMessage && isValidFrom && isValidTo && isValidMessage && !!authentication;
  }, [from, to, message, phoneNumbers, sendingMessage, authentication]);

  const hint = `Send a message from ${from === "" ? "?" : from} to ${to === "" ? "?" : to}`;

  if (authLoading || loadingPhoneNumbers) {
    return (
      <Layout>
        <p className="text-center text-gray-500">
          <Loading3QuartersOutlined spin className="mr-2" />
          Loading...
        </p>
      </Layout>
    );
  }

  return (
    <Layout>
      <h3>Send</h3>
      <p className="my-4">Select phone number to send a message from.</p>
      <ErrorLabel error={error} className="mb-4" />
      <div className="flex items-center">
        <label className="w-14">From:</label>
        <PhoneCombobox
          initial={from}
          options={phoneNumbers}
          onSelect={setFrom}
          loading={loadingPhoneNumbers}
          disabled={sendingMessage || !authentication}
        />
      </div>
      <div className="flex items-center mt-2">
        <label className="w-14">To:</label>
        <input
          type="tel"
          value={to}
          pattern={phonePattern}
          onChange={handleToOnChange}
          disabled={sendingMessage || !authentication}
          className="flex-1 border border-gray-300 rounded px-2 py-1"
        />
      </div>
      <textarea
        className="w-full mt-2 p-2 border border-gray-300 rounded"
        placeholder={hint}
        value={message}
        onChange={e => setMessage(e.target.value)}
        minLength={1}
        maxLength={500}
        disabled={sendingMessage || !authentication}
        rows={5}
      />
      <p className="text-xs font-thin m-0">
        Messages must be between 1 and 500 characters.
      </p>
      <button
        className="float-right mt-2 rounded bg-blue-600 px-4 py-2 text-white disabled:bg-gray-300"
        onClick={handleSend}
        disabled={!isValid}
      >
        {sendingMessage ? <Loading3QuartersOutlined spin /> : "Send"}
      </button>
    </Layout>
  );
};
