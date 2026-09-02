import express from 'express';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

// GET /api/notifications
// Fetch notifications based on role or user ID
router.get('/', async (req, res) => {
  try {
    const { id, role } = req.user;

    const notifications = await prisma.notification.findMany({
      where: {
        OR: [{ userId: id }, { role: role }],
      },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to last 50 notifications
    });

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Server error retrieving notifications.' });
  }
});

// PUT /api/notifications/:id/read
// Mark a notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return res
        .status(404)
        .json({ error: `Notification with ID ${id} not found.` });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating notification:', error);
    res
      .status(500)
      .json({ error: 'Server error marking notification as read.' });
  }
});

// PUT /api/notifications/read-all
// Mark all notifications for the user/role as read
router.put('/read-all', async (req, res) => {
  try {
    const { id, role } = req.user;

    const updated = await prisma.notification.updateMany({
      where: {
        OR: [{ userId: id }, { role: role }],
        isRead: false,
      },
      data: { isRead: true },
    });

    res.json({
      message: 'All notifications marked as read',
      count: updated.count,
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res
      .status(500)
      .json({ error: 'Server error marking all notifications as read.' });
  }
});

export default router;
