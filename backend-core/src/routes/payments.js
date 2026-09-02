import express from 'express';
import crypto from 'crypto';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

const MERCHANT_ID     = process.env.PAYHERE_MERCHANT_ID;
const MERCHANT_SECRET = process.env.PAYHERE_MERCHANT_SECRET;
const NGROK_URL       = process.env.PAYHERE_NGROK_URL;

// ─── Helper: generate MD5 hex ────────────────────────────────────────────────
const md5 = (str) => crypto.createHash('md5').update(str).digest('hex').toUpperCase();

// ─── POST /api/payments/hash ─────────────────────────────────────────────────
// Called by the frontend before redirecting to PayHere.
// Returns the HASH and all required form fields to initiate checkout.
router.post('/hash', async (req, res) => {
  try {
    const { orderId, amount, currency = 'LKR' } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({ error: 'orderId and amount are required.' });
    }

    // PayHere hash formula:
    // MD5( merchant_id + order_id + amount_formatted + currency + MD5(merchant_secret).toUpperCase() )
    const amountFormatted = parseFloat(amount).toFixed(2);
    const hashedSecret    = md5(MERCHANT_SECRET);
    const hash            = md5(`${MERCHANT_ID}${orderId}${amountFormatted}${currency}${hashedSecret}`);

    return res.json({
      merchant_id:  MERCHANT_ID,
      order_id:     orderId,
      amount:       amountFormatted,
      currency,
      hash,
      notify_url:   `${NGROK_URL}/api/payments/notify`,
      return_url:   'http://localhost:5173/#/dashboard',
      cancel_url:   'http://localhost:5173/#/catalog',
      sandbox:      true,
    });
  } catch (err) {
    console.error('[PayHere /hash]', err);
    return res.status(500).json({ error: 'Failed to generate payment hash.' });
  }
});

// ─── POST /api/payments/notify ───────────────────────────────────────────────
// PayHere calls this endpoint server-to-server after every payment.
// We verify the hash and update the order payment status in the database.
router.post('/notify', express.urlencoded({ extended: true }), async (req, res) => {
  try {
    const {
      merchant_id,
      order_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
    } = req.body;

    console.log('[PayHere notify]', req.body);

    // Verify the notification hash
    const hashedSecret     = md5(MERCHANT_SECRET);
    const expectedSig      = md5(
      `${merchant_id}${order_id}${payhere_amount}${payhere_currency}${status_code}${hashedSecret}`
    );

    if (expectedSig !== md5sig) {
      console.error('[PayHere notify] Hash mismatch! Possible fraud attempt.');
      return res.sendStatus(400);
    }

    // status_code 2 = Payment Success
    if (status_code === '2') {
      await prisma.order.update({
        where: { id: order_id },
        data:  { paymentStatus: 'PAID', status: 'PROCESSING' },
      });
      console.log(`[PayHere notify] Order ${order_id} marked as PAID.`);
    }

    // status_code 0  = Pending
    // status_code -1 = Cancelled
    // status_code -2 = Failed
    // status_code -3 = Chargedback
    if (['-1', '-2', '-3'].includes(status_code)) {
      await prisma.order.update({
        where: { id: order_id },
        data:  { paymentStatus: 'FAILED' },
      });
      console.log(`[PayHere notify] Order ${order_id} payment FAILED (code ${status_code}).`);
    }

    return res.sendStatus(200);
  } catch (err) {
    console.error('[PayHere notify error]', err);
    return res.sendStatus(500);
  }
});

export default router;
