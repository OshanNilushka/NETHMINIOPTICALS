import express from 'express';
import { prisma } from '../lib/prisma.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// POST /api/contacts (Public - submit contact inquiry)
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

// GET /api/contacts (Optician/Admin protected - view all contact messages)
router.get('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'OPTICIAN' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied. Optician or Admin privileges required.' });
    }

    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    res.status(500).json({ error: 'Failed to fetch contact messages.' });
  }
});

// PUT /api/contacts/:id/read (Optician/Admin protected - mark message as read)
router.put('/:id/read', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'OPTICIAN' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied. Optician or Admin privileges required.' });
    }

    const { id } = req.params;
    const updated = await prisma.contactMessage.update({
      where: { id },
      data: { isRead: true },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error marking contact message as read:', error);
    res.status(500).json({ error: 'Failed to update contact message.' });
  }
});

// DELETE /api/contacts/:id (Optician/Admin protected - delete contact message)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'OPTICIAN' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied. Optician or Admin privileges required.' });
    }

    const { id } = req.params;
    await prisma.contactMessage.delete({
      where: { id },
    });

    res.json({ success: true, message: 'Contact message deleted successfully.' });
  } catch (error) {
    console.error('Error deleting contact message:', error);
    res.status(500).json({ error: 'Failed to delete contact message.' });
  }
});

export default router;
