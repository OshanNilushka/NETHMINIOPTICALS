import express from 'express';
import { prisma } from '../lib/prisma.js';
import nodemailer from 'nodemailer';

const router = express.Router();

// GET /api/orders
// Retrieve all orders for optician/admin, or only patient's orders for patient
router.get('/', async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    let orders;
    if (userRole === 'PATIENT') {
      orders = await prisma.order.findMany({
        where: { patientId: userId },
        orderBy: { createdAt: 'desc' },
        include: {
          patient: {
            select: {
              fullName: true,
              email: true,
              phoneNumber: true,
            },
          },
          items: {
            include: {
              frame: true,
              lens: true,
            },
          },
        },
      });
    } else {
      orders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          patient: {
            select: {
              fullName: true,
              email: true,
              phoneNumber: true,
            },
          },
          items: {
            include: {
              frame: true,
              lens: true,
            },
          },
        },
      });
    }
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Server error retrieving orders.' });
  }
});

// POST /api/orders
// Place a new order with nested order items
router.post('/', async (req, res) => {
  let { items, frameId, lensId, quantity = 1, prescriptionId, shippingAddress, recipientName, recipientPhone, shippingCost = 0.0, paymentMethod = 'COD' } = req.body;

  let patientId = req.user.id;
  const isOpticianOrAdmin =
    req.user.role === 'OPTICIAN' || req.user.role === 'ADMIN';

  if (isOpticianOrAdmin && req.body.patientId) {
    patientId = req.body.patientId;
  }

  // Support backwards compatibility for single-item requests
  if (!items && frameId) {
    items = [{ frameId, lensId, quantity }];
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res
      .status(400)
      .json({ error: 'Order items are required.' });
  }

  try {
    let totalAmount = 0.0;
    const validatedItems = [];

    // 1. Validate all items before touching the database
    for (const item of items) {
      const { frameId: fId, lensId: lId, quantity: qty = 1 } = item;

      if (!fId) {
        return res
          .status(400)
          .json({ error: 'Frame product ID (frameId) is required for each item.' });
      }

      // Verify frame product exists and check stock
      const product = await prisma.product.findUnique({
        where: { id: fId },
      });

      if (!product) {
        return res
          .status(404)
          .json({ error: `Frame product with ID ${fId} not found.` });
      }

      if (product.stockLevel < qty) {
        return res.status(400).json({
          error: `Insufficient stock for frame "${product.name}". Only ${product.stockLevel} items available.`,
        });
      }

      // Optional: If lensId is provided, verify lens exists and check stock
      let lens = null;
      if (lId) {
        lens = await prisma.lens.findUnique({
          where: { id: lId },
        });
        if (!lens) {
          return res
            .status(404)
            .json({ error: `Lens with ID ${lId} not found.` });
        }
        if (lens.stockLevel < qty) {
          return res.status(400).json({
            error: `Insufficient stock for lens "${lens.type}". Only ${lens.stockLevel} items available.`,
          });
        }
      }

      const framePrice = product.price;
      const lensPrice = lens ? lens.price : 0.0;
      const itemUnitPrice = framePrice + lensPrice;
      totalAmount += itemUnitPrice * qty;

      validatedItems.push({
        frameId: fId,
        lensId: lId || null,
        quantity: qty,
        price: itemUnitPrice, // unit price at checkout
      });
    }

    // 2. Execute database write transaction (Order + OrderItems + Stock Update)
    const newOrder = await prisma.$transaction(async (tx) => {
      // Create Order and nested OrderItems
      const order = await tx.order.create({
        data: {
          patientId: patientId,
          prescriptionId: prescriptionId || null,
          totalAmount: totalAmount + parseFloat(shippingCost || 0.0),
          status: 'PENDING',
          shippingAddress: shippingAddress || null,
          recipientName: recipientName || null,
          recipientPhone: recipientPhone || null,
          shippingCost: parseFloat(shippingCost || 0.0),
          paymentMethod: paymentMethod || 'COD',
          paymentStatus: 'PENDING',
          items: {
            create: validatedItems.map((item) => ({
              frameId: item.frameId,
              lensId: item.lensId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          items: {
            include: {
              frame: true,
              lens: true,
            },
          },
        },
      });

      // Decrement stock levels for each item
      for (const item of validatedItems) {
        await tx.product.update({
          where: { id: item.frameId },
          data: {
            stockLevel: {
              decrement: item.quantity,
            },
          },
        });

        if (item.lensId) {
          await tx.lens.update({
            where: { id: item.lensId },
            data: {
              stockLevel: {
                decrement: item.quantity,
              },
            },
          });
        }
      }

      return order;
    });

    // Create a notification
    try {
      const patient = await prisma.user.findUnique({
        where: { id: patientId },
        select: { fullName: true },
      });
      const patientName = patient?.fullName || 'A patient';

      if (isOpticianOrAdmin) {
        await prisma.notification.create({
          data: {
            userId: patientId,
            title: 'New Order Created',
            message: `An order has been created for you by the optician. Total Amount: $${newOrder.totalAmount.toFixed(2)}.`,
            type: 'ORDER_CREATED',
            relatedId: newOrder.id,
          },
        });
      } else {
        await prisma.notification.create({
          data: {
            role: 'OPTICIAN',
            title: 'New Order Placed',
            message: `${patientName} placed a new order. Total Amount: $${newOrder.totalAmount.toFixed(2)}.`,
            type: 'ORDER_PLACED',
            relatedId: newOrder.id,
          },
        });
      }
    } catch (notifError) {
      console.error('Failed to create order notification:', notifError);
    }

    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ error: 'Server error processing order placement.' });
  }
});

// DELETE /api/orders/:id
// Cancel a pending order and restore stock levels
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const patientId = req.user.id; // From authMiddleware

  try {
    // 1. Find the order with nested items
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: `Order with ID ${id} not found.` });
    }

    // 2. Security: Verify order belongs to the logged-in patient
    if (order.patientId !== patientId) {
      return res
        .status(403)
        .json({ error: 'Unauthorized to cancel this order.' });
    }

    // 3. Status check: Only PENDING orders can be cancelled
    if (order.status !== 'PENDING') {
      return res.status(400).json({
        error: `Cannot cancel an order with status: ${order.status}.`,
      });
    }

    // 4. Run database transaction to update status and restore stock levels
    const cancelledOrder = await prisma.$transaction(async (tx) => {
      // Update order status to CANCELLED
      const updated = await tx.order.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });

      // Restore stock levels for each item in the order
      for (const item of order.items) {
        if (item.frameId) {
          await tx.product.update({
            where: { id: item.frameId },
            data: {
              stockLevel: {
                increment: item.quantity,
              },
            },
          });
        }
        if (item.lensId) {
          await tx.lens.update({
            where: { id: item.lensId },
            data: {
              stockLevel: {
                increment: item.quantity,
              },
            },
          });
        }
      }

      return updated;
    });

    res.json({
      message: 'Order cancelled successfully',
      order: cancelledOrder,
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res
      .status(500)
      .json({ error: 'Server error processing order cancellation.' });
  }
});

// PUT /api/orders/:id
// Update order details (Optician / Admin only)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { status, shippingAddress, recipientName, recipientPhone, courierName, trackingNumber, paymentStatus } = req.body;
  const userRole = req.user.role;

  if (userRole !== 'OPTICIAN' && userRole !== 'ADMIN') {
    return res.status(403).json({
      error: 'Unauthorized. Only opticians and admins can modify orders.',
    });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { patient: true },
    });

    if (!order) {
      return res.status(404).json({ error: `Order with ID ${id} not found.` });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(shippingAddress !== undefined && { shippingAddress }),
        ...(recipientName !== undefined && { recipientName }),
        ...(recipientPhone !== undefined && { recipientPhone }),
        ...(courierName !== undefined && { courierName }),
        ...(trackingNumber !== undefined && { trackingNumber }),
        ...(paymentStatus !== undefined && { paymentStatus }),
      },
    });

    // Send email notification on status change (e.g. READY_FOR_PICKUP or COMPLETED)
    if (status && status !== order.status) {
      await sendOrderStatusEmail(updatedOrder, order.patient, status);
    }

    res.json({
      message: 'Order updated successfully',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res
      .status(500)
      .json({ error: 'Server error processing order update.' });
  }
});

// POST /api/orders/notify-pickup
// Send email notifications to all or specific patient(s) with orders ready for pickup
router.post('/notify-pickup', async (req, res) => {
  const userRole = req.user.role;
  if (userRole !== 'OPTICIAN' && userRole !== 'ADMIN') {
    return res.status(403).json({
      error: 'Unauthorized. Only opticians and admins can trigger notifications.',
    });
  }

  try {
    const { orderId, orderIds } = req.body || {};
    let whereCondition = { status: 'READY_FOR_PICKUP' };

    if (orderId) {
      whereCondition = { id: orderId };
    } else if (orderIds && Array.isArray(orderIds) && orderIds.length > 0) {
      whereCondition = { id: { in: orderIds } };
    }

    const readyOrders = await prisma.order.findMany({
      where: whereCondition,
      include: {
        patient: true,
        items: {
          include: { frame: true, lens: true }
        }
      },
    });

    for (const order of readyOrders) {
      await sendOrderStatusEmail(order, order.patient, 'READY_FOR_PICKUP');
      // Set status to COMPLETED to finalize the order and lock it from further editing
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'COMPLETED' },
      });
    }

    res.json({
      success: true,
      message: `Notification email(s) successfully sent & order(s) locked as Completed for ${readyOrders.length} customer(s).`,
      count: readyOrders.length,
      notifiedOrderIds: readyOrders.map((o) => o.id),
    });
  } catch (error) {
    console.error('Error sending pickup notifications:', error);
    res.status(500).json({ error: 'Server error sending pickup notifications.' });
  }
});

// Helper function to send order status update email using nodemailer
async function sendOrderStatusEmail(order, patient, status) {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    console.log('--- EMAIL CONFIGURATION MISSING ---');
    console.log('Cannot send order status update email.');
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    let subject = '';
    let htmlContent = '';

    if (status === 'READY_FOR_PICKUP') {
      subject = `Nethmini Opticals - Order Ready for Pickup (${order.id.substring(0, 8).toUpperCase()})`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #1b5e85;">Your Order is Ready for Pickup! 🎉</h2>
          <p>Hello ${patient.fullName},</p>
          <p>Great news! Your eyewear order <strong>${order.id.substring(0, 8).toUpperCase()}</strong> is ready for customer pickup.</p>
          <p>You can collect your order from our store:</p>
          <div style="background: #f4f8fa; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1b5e85;">
            <strong>Store Location:</strong> Nethmini Opticals - Giriulla Branch
          </div>
          <p>Please bring a copy of this email or your Order ID when you come to collect it.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin-top: 30px;" />
          <p style="font-size: 11px; color: #999; text-align: center;">Nethmini Opticals Team</p>
        </div>
      `;
    } else if (status === 'COMPLETED') {
      subject = `Nethmini Opticals - Order Completed (${order.id.substring(0, 8).toUpperCase()})`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #2e7d32;">Order Completed Successfully! 🏁</h2>
          <p>Hello ${patient.fullName},</p>
          <p>Your order <strong>${order.id.substring(0, 8).toUpperCase()}</strong> has been completed and marked as picked up / delivered.</p>
          <p>Thank you for choosing Nethmini Opticals for your visual health needs. We hope you love your new eyewear!</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin-top: 30px;" />
          <p style="font-size: 11px; color: #999; text-align: center;">Nethmini Opticals Team</p>
        </div>
      `;
    } else {
      return; // Do not send email for other statuses
    }

    const mailOptions = {
      from: `"Nethmini Opticals" <${emailUser}>`,
      to: patient.email.toLowerCase(),
      subject: subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL SENT] Order status email sent to ${patient.email} for status ${status}`);
  } catch (error) {
    console.error('Error sending order status email:', error);
  }
}

export default router;
