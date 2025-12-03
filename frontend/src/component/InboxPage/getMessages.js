import { getTwilioMessages, sortByDate } from "../../js/getTwilioMessages";
import { allPhones, MessageFilterEnum } from "./Selector";

/**
 * @typedef {import ("../../js/getTwilioMessages").Message} Message
 */

const BACKEND_URL = import.meta.env.VITE_PRODUCTION_URL || "http://localhost:3001";

/**
 * Get filtered messages
 * @param {string|string[]} phoneNumber
 * @param {MessageFilterEnum} filter
 * @returns {Promise<Array<Message>>}
 */
export const getMessages = async (phoneNumber = allPhones, filter = MessageFilterEnum.all) => {
  console.log("🔍 getMessages called with:", { phoneNumber, filter });

  // "All phone numbers" – aggregate from all Twilio numbers
  if (phoneNumber === allPhones) {
    const allMessages = [];

    // 1. Get your Twilio phone numbers first
    const response = await fetch(`${BACKEND_URL}/twilio-sms-web/api/phone-numbers`, {
      credentials: "include",
    });
    const twilioNumbers = await response.json();
    console.log("📞 Found Twilio numbers:", twilioNumbers);

    // 2. Fetch messages for each number (sent + received)
    for (const number of twilioNumbers) {
      try {
        console.log(`📱 Fetching messages for ${number}...`);

        // Sent messages (from this number)
        const sent = await getTwilioMessages(number);
        const sentArray = Array.isArray(sent) ? sent : sent?.messages || [];
        allMessages.push(...sentArray);

        // Received messages (to this number)
        const received = await getTwilioMessages(undefined, number);
        const receivedArray = Array.isArray(received) ? received : received?.messages || [];
        allMessages.push(...receivedArray);

        console.log(
          `✅ ${number}: ${sentArray.length} sent, ${receivedArray.length} received`
        );
      } catch (err) {
        console.warn(`Failed to fetch messages for ${number}:`, err.message);
      }
    }

    console.log(`📨 Total messages from all numbers: ${allMessages.length}`);
    return sortByDate(allMessages);
  }

  // Single phone number logic

  // Only received messages (to this number)
  if (MessageFilterEnum.received === filter) {
    const received = await getTwilioMessages(undefined, phoneNumber);
    const receivedArray = Array.isArray(received) ? received : received?.messages || [];
    return sortByDate(receivedArray);
  }

  // Only sent messages (from this number)
  if (MessageFilterEnum.sent === filter) {
    const sent = await getTwilioMessages(phoneNumber);
    const sentArray = Array.isArray(sent) ? sent : sent?.messages || [];
    return sortByDate(sentArray);
  }

  // All messages for this number (sent + received)
  const from = await getTwilioMessages(phoneNumber);
  const fromArray = Array.isArray(from) ? from : from?.messages || [];

  const to = await getTwilioMessages(undefined, phoneNumber);
  const toArray = Array.isArray(to) ? to : to?.messages || [];

  return sortByDate(fromArray.concat(toArray));
};
