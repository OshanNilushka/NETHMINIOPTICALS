import express from 'express';
import { prisma } from '../lib/prisma.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// GET /api/reviews/approved (Public - for home page carousel)
router.get('/approved', async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      include: {
        patient: {
          select: {
            fullName: true,
            email: true,
          },
        },
        frame: {
          select: {
            name: true,
          },
        },
      },
    });

    res.json(reviews);
  } catch (error) {
    console.error('Error fetching approved reviews:', error);
    res.status(500).json({ error: 'Failed to fetch approved reviews.' });
  }
});

// GET /api/reviews/my (Patient protected - customer's own reviews)
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const patientId = req.user.id;
    const reviews = await prisma.review.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
      include: {
        frame: {
          select: {
            name: true,
          },
        },
      },
    });

    res.json(reviews);
  } catch (error) {
    console.error('Error fetching patient reviews:', error);
    res.status(500).json({ error: 'Failed to fetch your reviews.' });
  }
});

// POST /api/reviews (Patient protected - submit new feedback)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const patientId = req.user.id;
    const { rating, comment, frameId } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5 stars.' });
    }

    if (!comment || !comment.trim()) {
      return res.status(400).json({ error: 'Feedback comment is required.' });
    }

    const reviewData = {
      patientId,
      rating: parseInt(rating, 10),
      comment: comment.trim(),
      status: 'PENDING',
    };
    if (frameId) {
      reviewData.frameId = frameId;
    }

    const newReview = await prisma.review.create({
      data: reviewData,
      include: {
        patient: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully. It will be displayed after optician review.',
      review: newReview,
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: error.message || 'Failed to submit feedback.' });
  }
});

// GET /api/reviews/all (Optician / Admin protected - view all or pending feedbacks)
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const role = req.user.role;
    if (role !== 'OPTICIAN' && role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied. Optician or Admin privileges required.' });
    }

    const { status } = req.query;
    const whereCondition = status ? { status: status.toUpperCase() } : {};

    const reviews = await prisma.review.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' },
      include: {
        patient: {
          select: {
            fullName: true,
            email: true,
          },
        },
        frame: {
          select: {
            name: true,
          },
        },
      },
    });

    res.json(reviews);
  } catch (error) {
    console.error('Error fetching all reviews for optician:', error);
    res.status(500).json({ error: 'Failed to fetch reviews.' });
  }
});

// PUT /api/reviews/:id/status (Optician / Admin protected - approve or reject feedback)
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const role = req.user.role;
    if (role !== 'OPTICIAN' && role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied. Optician or Admin privileges required.' });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be APPROVED, REJECTED, or PENDING.' });
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: { status },
      include: {
        patient: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: `Feedback ${status.toLowerCase()} successfully.`,
      review: updatedReview,
    });
  } catch (error) {
    console.error('Error updating review status:', error);
    res.status(500).json({ error: 'Failed to update review status.' });
  }
});

export default router;
