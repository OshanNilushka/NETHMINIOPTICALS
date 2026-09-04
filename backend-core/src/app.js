import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import fs from 'fs';
import { prisma } from './lib/prisma.js';
import authRouter from './routes/auth.js';
import authMiddleware from './middleware/auth.js';
import productsRouter from './routes/products.js';
import ordersRouter from './routes/orders.js';
import appointmentsRouter from './routes/appointments.js';
import notificationsRouter from './routes/notifications.js';
import prescriptionsRouter from './routes/prescriptions.js';
import adminRouter from './routes/admin.js';
import paymentsRouter from './routes/payments.js';
import contactsRouter from './routes/contacts.js';
import reviewsRouter from './routes/reviews.js';

// Ensure public/uploads directory exists (useful locally, for cloud production use S3/Cloudinary)
if (!fs.existsSync('public/uploads')) {
  try {
    fs.mkdirSync('public/uploads', { recursive: true });
  } catch (err) {
    console.log('Uploads directory creation skipped:', err.message);
  }
}

const app = express();

app.use(cors());
app.use(express.json());

// Serve static uploaded files
app.use('/uploads', express.static('public/uploads'));

// Auth routes
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', authMiddleware, ordersRouter);
app.use('/api/appointments', authMiddleware, appointmentsRouter);
app.use('/api/notifications', authMiddleware, notificationsRouter);
app.use('/api/prescriptions', authMiddleware, prescriptionsRouter);
app.use('/api/admin', adminRouter);
// Payments — NO auth middleware (PayHere notify_url must be publicly reachable)
app.use('/api/payments', paymentsRouter);
// Contacts — NO auth middleware for public contact form
app.use('/api/contacts', contactsRouter);
// Reviews / Customer Feedback (handles public & auth endpoints internally)
app.use('/api/reviews', reviewsRouter);

app.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'InsightOpticals Core Backend (Express.js)',
  });
});

app.get('/health', async (req, res) => {
  try {
    // Quick query to confirm DB connectivity
    await prisma.user.findFirst();
    res.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: String(error) });
  }
});

// Secure profile route
app.get('/api/users/profile', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        prescriptionsAsPatient: {
          orderBy: { createdAt: 'desc' },
        },
        orders: {
          orderBy: { createdAt: 'desc' },
          include: {
            items: {
              include: {
                frame: true,
                lens: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    // Omit hashed password from response
    const safeUser = { ...user };
    delete safeUser.password;
    res.json(safeUser);
  } catch (error) {
    console.error('Fetch profile error:', error);
    res.status(500).json({ error: 'Server error retrieving user profile.' });
  }
});

export default app;
