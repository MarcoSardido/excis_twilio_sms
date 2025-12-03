/**
 * Send a Twilio message via backend
 * @param {string} from - sender number
 * @param {string} to - recipient number
 * @param {string} body - message body
 * @returns {Promise<string>} message SID
 */
export const sendTwilioMessage = async (from, to, body) => {
  const res = await fetch(
    `${import.meta.env.VITE_PRODUCTION_URL || "http://localhost:3001"}/twilio-sms-web/api/messages`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, body }),
    }
  );
  if (!res.ok) throw new Error("Failed to send message");
  const data = await res.json();
  return data.sid;
};
