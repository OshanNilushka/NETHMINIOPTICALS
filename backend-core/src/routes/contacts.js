import express from 'express';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

// POST /api/contacts
// Create a new contact message
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, message } = req.body;

    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({ error: 'First name, last name, email, and message are required.' });
    }

    const contactMessage = await prisma.contactMessage.create({
      data: {
        name: `${firstName} ${lastName}`,
        email,
        phone: phoneNumber || null,
        message,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Contact message submitted successfully.',
      data: contactMessage,
    });
  } catch (error) {
    console.error('Error saving contact message:', error);
    res.status(500).json({ error: 'Server error saving contact message.' });
  }
});

export default router;
