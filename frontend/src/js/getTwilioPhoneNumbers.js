/**
 * Fetch all Twilio phone numbers from backend
 * @returns {Promise<Array<string>>} Array of phone numbers
 */
export const getTwilioPhoneNumbers = async () => {
  const res = await fetch(
    `${import.meta.env.VITE_PRODUCTION_URL || "http://localhost:3001"}/twilio-sms-web/api/phone-numbers`,
    { credentials: "include" }
  );
  if (!res.ok) throw new Error("Failed to fetch phone numbers");
  return res.json();
};
