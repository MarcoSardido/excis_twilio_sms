import express from "express";
import { ensureAuthenticated } from "../auth/auth.js"; // fixed import
import {
  fetchMessages,
  fetchPhoneNumbers,
  sendMessage,
  fetchMedia,
  getSyncDocument,
} from "../services/twilioService.js";

const router = express.Router();

// Get authenticated user info
router.get("/me", ensureAuthenticated, (req, res) => {
  res.json({ user: req.user });
});

// Fetch Twilio messages
router.get("/messages", ensureAuthenticated, async (req, res) => {
  const { from, to } = req.query;

  try {
    // 🔧 FIX: Validate params and pass options object
    if (!from && !to) {
      return res.status(400).json({
        error: 'At least one of "from" or "to" phone number (E.164 format) required'
      });
    }

    const messages = await fetchMessages(from, to, { pageSize: 10 });
    res.json(messages);
  } catch (err) {
    console.error('Twilio fetchMessages error:', err);
    res.status(500).json({ error: err.message });
  }
});


// Fetch Twilio phone numbers
router.get("/phone-numbers", ensureAuthenticated, async (_, res) => {
  try {
    const numbers = await fetchPhoneNumbers();
    res.json(numbers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send a Twilio message
router.post("/messages", ensureAuthenticated, async (req, res) => {
  const { from, to, body } = req.body;
  try {
    const sid = await sendMessage(from, to, body);
    res.json({ sid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch media URLs for a message
router.get("/media/:messageSid", ensureAuthenticated, async (req, res) => {
  const { messageSid } = req.params;
  try {
    const urls = await fetchMedia(messageSid);
    res.json(urls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get or create Twilio Sync Document
router.get("/sync-document", ensureAuthenticated, async (_, res) => {
  try {
    const doc = await getSyncDocument();
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
