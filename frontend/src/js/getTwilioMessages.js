/**
 * @typedef {Object} Message
 * @property {string} messageSid
 * @property {string} from
 * @property {string} to
 * @property {string} body
 * @property {string} date
 * @property {"sent"|"received"} direction
 * @property {"sending"|"failed"|"undelivered"|string} [status]
 * @property {number} [media]
 * @property {boolean} [hasMedia]
 */

/**
 * Backend base URL
 */
const BACKEND_URL = import.meta.env.VITE_PRODUCTION_URL || "http://localhost:3001";

/**
 * Fetch messages from Twilio API
 * @param {string} [from]
 * @param {string} [to]
 * @returns {Promise<Array<Message>>}
 */
export const getTwilioMessages = async (from, to) => {
  const queryParams = new URLSearchParams();
  if (from) queryParams.append("from", from);
  if (to) queryParams.append("to", to);

  const res = await fetch(`${BACKEND_URL}/twilio-sms-web/api/messages?${queryParams.toString()}`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch Twilio messages");
  }

  const messages = await res.json();
  return messages;
};

/**
 * Fetch a single Twilio message by SID
 * @param {string} messageSid
 * @returns {Promise<Message>}
 */
export const getTwilioMessage = async (messageSid) => {
  const res = await fetch(`${BACKEND_URL}/twilio-sms-web/api/messages/${messageSid}`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch Twilio message with SID ${messageSid}`);
  }

  const message = await res.json();
  return message;
};

/**
 * Sort messages by date ascending
 * @param {Array<Message>} messages
 * @returns {Array<Message>}
 */
export const sortByDate = (messages) => {
  return [...messages].sort((a, b) => new Date(a.date) - new Date(b.date));
};
