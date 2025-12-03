import Twilio from "twilio";
import { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } from "../config.js";

const client = Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

/**
 * Fetch messages between two numbers using Twilio's cursor-based pagination.
 * @param {string} from
 * @param {string} to
 * @param {object} options
 * @param {number} options.pageSize
 * @param {string} options.pageToken - optional, for fetching older pages
 */

export const fetchMessages = async (from, to, options = { pageSize: 10 }) => {
  try {
    const { pageSize = 10, pageToken } = options;
    const params = { limit: pageSize };

    if (from) params.from = from;
    if (to) params.to = to;

    if (!params.from && !params.to) {
      throw new Error('At least one phone number filter (from or to) required');
    }

    const page = await client.messages.page(params);

    // 🔧 CRITICAL: Defensive records check
    const records = page.records || [];
    if (!Array.isArray(records)) {
      return { messages: [], nextPageToken: page.nextPageToken || null };
    }

    const sorted = records.sort((a, b) =>
      new Date(a.dateCreated) - new Date(b.dateCreated)
    );

    return {
      messages: sorted.map(m => ({
        sid: m.sid, from: m.from, to: m.to, body: m.body,
        status: m.status, date: m.dateCreated?.toISOString() || null,
        direction: m.direction, numMedia: m.numMedia,
        hasMedia: Number(m.numMedia || 0) > 0,
      })),
      nextPageToken: page.nextPageToken || null,
    };
  } catch (error) {
    throw error;
  }
};



export const fetchPhoneNumbers = async () => {
  const numbers = await client.incomingPhoneNumbers.list();
  return numbers.filter(n => n.capabilities.sms).map(n => n.phoneNumber);
};

export const sendMessage = async (from, to, body) => {
  const msg = await client.messages.create({ from, to, body });
  return msg.sid;
};

export const fetchMedia = async (messageSid) => {
  const mediaList = await client.messages(messageSid).media.list();
  return mediaList.map(m => `https://api.twilio.com${m.uri.replace(".json", "")}`);
};

export const getSyncDocument = async () => {
  const SERVICE_SID = "YOUR_SYNC_SERVICE_SID";
  const UNIQUE_NAME = "twilio_sms_web";

  try {
    return await client.sync.services(SERVICE_SID).documents(UNIQUE_NAME).fetch();
  } catch (err) {
    if (err.status === 404) {
      return await client.sync.services(SERVICE_SID).documents.create({
        UniqueName: UNIQUE_NAME,
        Data: "{}",
      });
    }
    throw err;
  }
};
