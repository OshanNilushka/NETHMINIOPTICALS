import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { prisma } from '../lib/prisma.js';

const router = express.Router();
const otpStore = new Map();

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, fullName, phone, dob, gender } = req.body;

    if (!email || !password || !fullName) {
      return res
        .status(400)
        .json({ error: 'Email, password, and full name are required.' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: 'An account with this email already exists.' });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in PostgreSQL
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        fullName,
        phoneNumber: phone || null,
        dob: dob ? new Date(dob) : null,
        gender: gender || null,
        role: 'PATIENT', // default role for customers
      },
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Optional: Validate requested role matches database role
    if (role && user.role !== role) {
      return res
        .status(403)
        .json({ error: `Unauthorized role login attempt.` });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!user) {
      return res
        .status(404)
        .json({ error: 'No user found with this email address.' });
    }

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(email.toLowerCase(), { otp, expiresAt });
    console.log(`[OTP GENERATED] Email: ${email}, OTP: ${otp}`);

    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (emailUser && emailPass) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });

      const mailOptions = {
        from: `"Nethmini Opticals Support" <${emailUser}>`,
        to: email.toLowerCase(),
        subject: 'Nethmini Opticals - Password Reset OTP',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #1b5e85;">Password Reset Verification</h2>
            <p>Hello ${user.fullName},</p>
            <p>We received a request to reset the password for your Nethmini Opticals account. Use the following verification code to proceed:</p>
            <div style="font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 5px; margin: 30px 0; color: #1b5e85; background: #f4f8fa; padding: 15px; border-radius: 8px;">
              ${otp}
            </div>
            <p style="font-size: 13px; color: #666;">This OTP is valid for the next 10 minutes. If you did not make this request, you can safely ignore this email.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin-top: 30px;" />
            <p style="font-size: 11px; color: #999; text-align: center;">Nethmini Opticals Team</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(
        `[EMAIL SENT] Password reset email successfully sent to ${email}`,
      );
    } else {
      console.log('--- EMAIL CONFIGURATION MISSING ---');
      console.log(
        `Please set EMAIL_USER and EMAIL_PASS in your backend-core/.env to send real emails.`,
      );
      console.log(
        `For testing, enter the OTP displayed above in the frontend.`,
      );
      console.log('-----------------------------------');
    }

    res.json({ message: 'Reset OTP has been sent. Please check your inbox.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Server error sending verification code.' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res
      .status(400)
      .json({ error: 'Email, OTP, and new password are required.' });
  }

  const stored = otpStore.get(email.toLowerCase());
  if (!stored) {
    return res
      .status(400)
      .json({ error: 'Verification code expired or not requested.' });
  }

  if (stored.expiresAt < Date.now()) {
    otpStore.delete(email.toLowerCase());
    return res.status(400).json({ error: 'Verification code has expired.' });
  }

  if (stored.otp !== otp.trim()) {
    return res.status(400).json({ error: 'Invalid verification code.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    otpStore.delete(email.toLowerCase());

    res.json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Server error resetting password.' });
  }
});

export default router;
