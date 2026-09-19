import express from 'express';
import Stripe from 'stripe';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

const getStripe = () => {
  const key = (process.env.STRIPE_SECRET_KEY || '').trim();
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is missing in environment variables.');
  }
  return new Stripe(key);
};

// ─── POST /api/payments/create-checkout-session ──────────────────────────────
// Initiates a Stripe Checkout session for an order
router.post('/create-checkout-session', async (req, res) => {
  try {
    const stripe = getStripe();
    const { orderId, amount, currency = 'lkr', items = [] } = req.body;

    if (!orderId || amount === undefined || amount === null) {
      return res.status(400).json({ error: 'orderId and amount are required.' });
    }

    const origin = req.headers.origin || process.env.FRONTEND_URL || 'https://nethminiopticals.vercel.app';
    const amountInUnits = Math.round(parseFloat(amount) * 100); // Stripe requires amount in smallest currency unit (cents/cents equivalent)

    // Build item description
    const lineItemTitle = items.length > 0
      ? `Optical Order #${orderId.slice(-6)} (${items.map(i => i.name || 'Item').slice(0, 2).join(', ')})`
      : `Nethmini Opticals Order #${orderId.slice(-6)}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: lineItemTitle,
              description: 'Nethmini Opticals Prescription Glasses & Lenses Checkout',
            },
            unit_amount: amountInUnits,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/#/dashboard?payment=success&order_id=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#/catalog?payment=cancelled`,
      metadata: {
        orderId,
      },
    });

    return res.json({
      id: session.id,
      url: session.url,
    });
  } catch (err) {
    console.error('[Stripe /create-checkout-session]', err);
    return res.status(500).json({ error: err.message || 'Failed to create Stripe checkout session.' });
  }
});

// ─── POST /api/payments/verify-session ────────────────────────────────────────
// Frontend calls this when redirected back to verify session status & update DB
router.post('/verify-session', async (req, res) => {
  try {
    const stripe = getStripe();
    const { sessionId, orderId } = req.body;

    if (!sessionId && !orderId) {
      return res.status(400).json({ error: 'sessionId or orderId is required.' });
    }

    let session = null;
    let targetOrderId = orderId;

    if (sessionId) {
      session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session && session.metadata && session.metadata.orderId) {
        targetOrderId = session.metadata.orderId;
      }
    }

    if (!targetOrderId) {
      return res.status(404).json({ error: 'Order ID could not be identified.' });
    }

    // Check payment status from Stripe session if available
    const isPaid = session ? session.payment_status === 'paid' : true;

    if (isPaid) {
      const updatedOrder = await prisma.order.update({
        where: { id: targetOrderId },
        data: {
          paymentStatus: 'PAID',
          status: 'PROCESSING',
        },
      });
      console.log(`[Stripe verify-session] Order ${targetOrderId} marked as PAID.`);
      return res.json({ status: 'PAID', order: updatedOrder });
    } else {
      return res.status(400).json({ status: 'UNPAID', error: 'Payment has not been completed.' });
    }
  } catch (err) {
    console.error('[Stripe /verify-session]', err);
    return res.status(500).json({ error: 'Failed to verify payment session.' });
  }
});

// ─── POST /api/payments/webhook ──────────────────────────────────────────────
// Stripe server-to-server webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    const stripe = getStripe();
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      // Direct JSON fallback if no webhook secret configured during dev
      const payload = typeof req.body === 'string' || Buffer.isBuffer(req.body) 
        ? JSON.parse(req.body.toString()) 
        : req.body;
      event = payload;
    }
  } catch (err) {
    console.error('[Stripe Webhook signature verification error]', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle successful checkout
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'PAID', status: 'PROCESSING' },
      });
      console.log(`[Stripe Webhook] Order ${orderId} updated to PAID.`);
    }
  }

  return res.json({ received: true });
});

export default router;


