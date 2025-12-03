/**
 * Fetch media URLs for a given Twilio message via backend
 * @param {string} messageSid
 * @returns {Promise<Array<string>>} media URLs
 */
export const getTwilioMedia = async (messageSid) => {
  const res = await fetch(
    `${import.meta.env.VITE_PRODUCTION_URL || "http://localhost:3001"}/twilio-sms-web/api/media/${messageSid}`,
    { credentials: "include" }
  );
  if (!res.ok) throw new Error("Failed to fetch media");
  return res.json();
};
