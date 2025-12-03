/**
 * Get or create Twilio Sync document via backend
 * @returns {Promise<Object>} document object
 */
export const getOrCreateTwilioDocument = async () => {
  const res = await fetch(
    `${import.meta.env.VITE_PRODUCTION_URL || "http://localhost:3001"}/twilio-sms-web/api/sync-document`,
    { credentials: "include" }
  );
  if (!res.ok) throw new Error("Failed to fetch sync document");
  return res.json();
};
