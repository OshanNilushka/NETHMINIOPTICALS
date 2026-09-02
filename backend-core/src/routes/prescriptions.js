import express from 'express';
import { prisma } from '../lib/prisma.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Jimp } from 'jimp';
import Tesseract from 'tesseract.js';
import { GoogleGenerativeAI } from '@google/generative-ai';


const router = express.Router();

// GET /api/prescriptions/patients
// Fetch all patients with their prescriptions and orders (Optician/Admin only)
router.get('/patients', async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'OPTICIAN' && role !== 'ADMIN') {
      return res.status(403).json({
        error:
          'Unauthorized. Only opticians and admins can access patient records.',
      });
    }

    const patients = await prisma.user.findMany({
      where: { role: 'PATIENT' },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        dob: true,
        gender: true,
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
      orderBy: { fullName: 'asc' },
    });

    res.json(patients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ error: 'Server error fetching patients.' });
  }
});

// POST /api/prescriptions
// Patient uploads a prescription for validation, OR optician logs a prescription for a patient
router.post('/', async (req, res) => {
  const {
    odSph,
    odCyl,
    odAxis,
    osSph,
    osCyl,
    osAxis,
    pd,
    ocrImageUrl,
    rawOcrResult,
  } = req.body;

  let patientId = req.user.id;
  const isOpticianOrAdmin =
    req.user.role === 'OPTICIAN' || req.user.role === 'ADMIN';

  if (isOpticianOrAdmin && req.body.patientId) {
    patientId = req.body.patientId;
  }

  try {
    // 1. Create prescription record
    const prescription = await prisma.prescription.create({
      data: {
        patientId,
        odSph: odSph ? parseFloat(odSph) : null,
        odCyl: odCyl ? parseFloat(odCyl) : null,
        odAxis: odAxis ? parseInt(odAxis) : null,
        osSph: osSph ? parseFloat(osSph) : null,
        osCyl: osCyl ? parseFloat(osCyl) : null,
        osAxis: osAxis ? parseInt(osAxis) : null,
        pd: pd ? parseFloat(pd) : null,
        ocrImageUrl: ocrImageUrl || null,
        rawOcrResult: rawOcrResult || null,
        status: isOpticianOrAdmin ? 'VALIDATED' : 'PENDING',
        isValidated: isOpticianOrAdmin,
        opticianId: isOpticianOrAdmin ? req.user.id : null,
      },
    });

    // 2. Fetch patient name
    const patient = await prisma.user.findUnique({
      where: { id: patientId },
      select: { fullName: true },
    });

    const patientName = patient?.fullName || 'A patient';

    // 3. Create notifications
    if (isOpticianOrAdmin) {
      await prisma.notification.create({
        data: {
          userId: patientId,
          title: 'New Prescription Logged',
          message: `Dr. ${req.user.fullName || 'The optician'} has added a validated prescription to your profile.`,
          type: 'PRESCRIPTION_VALIDATED',
          relatedId: prescription.id,
        },
      });
    } else {
      await prisma.notification.create({
        data: {
          role: 'OPTICIAN',
          title: 'New Prescription Validation Request',
          message: `${patientName} uploaded a new prescription and requested validation.`,
          type: 'PRESCRIPTION_PENDING',
          relatedId: prescription.id,
        },
      });
    }

    res.status(201).json(prescription);
  } catch (error) {
    console.error('Error creating prescription:', error);
    res.status(500).json({ error: 'Server error saving prescription.' });
  }
});

// GET /api/prescriptions
// Fetch prescriptions based on role
router.get('/', async (req, res) => {
  try {
    const { id, role } = req.user;
    let prescriptions;

    if (role === 'PATIENT') {
      prescriptions = await prisma.prescription.findMany({
        where: { patientId: id },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      prescriptions = await prisma.prescription.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          patient: {
            select: {
              fullName: true,
              email: true,
              phoneNumber: true,
            },
          },
        },
      });
    }

    res.json(prescriptions);
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    res.status(500).json({ error: 'Server error fetching prescriptions.' });
  }
});

// PUT /api/prescriptions/:id/status
// Optician/Admin validates or rejects a prescription
router.put('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, odSph, odCyl, odAxis, osSph, osCyl, osAxis, pd, odAdd, rejectionReason } =
    req.body;
  const { role, id: opticianId } = req.user;

  if (role !== 'OPTICIAN' && role !== 'ADMIN') {
    return res.status(403).json({
      error:
        'Unauthorized. Only opticians and admins can validate prescriptions.',
    });
  }

  if (!status || !['VALIDATED', 'REJECTED', 'PENDING'].includes(status)) {
    return res.status(400).json({
      error: 'Invalid or missing status (VALIDATED, REJECTED, PENDING).',
    });
  }

  try {
    const prescription = await prisma.prescription.findUnique({
      where: { id },
    });

    if (!prescription) {
      return res
        .status(404)
        .json({ error: `Prescription with ID ${id} not found.` });
    }

    const updated = await prisma.prescription.update({
      where: { id },
      data: {
        status,
        isValidated: status === 'VALIDATED',
        opticianId,
        rejectionReason: status === 'REJECTED' ? (rejectionReason || null) : null,
        ...(odSph !== undefined && {
          odSph: odSph !== null && odSph !== '' ? parseFloat(odSph) : null,
        }),
        ...(odCyl !== undefined && {
          odCyl: odCyl !== null && odCyl !== '' ? parseFloat(odCyl) : null,
        }),
        ...(odAxis !== undefined && {
          odAxis: odAxis !== null && odAxis !== '' ? parseInt(odAxis) : null,
        }),
        ...(osSph !== undefined && {
          osSph: osSph !== null && osSph !== '' ? parseFloat(osSph) : null,
        }),
        ...(osCyl !== undefined && {
          osCyl: osCyl !== null && osCyl !== '' ? parseFloat(osCyl) : null,
        }),
        ...(osAxis !== undefined && {
          osAxis: osAxis !== null && osAxis !== '' ? parseInt(osAxis) : null,
        }),
        ...(pd !== undefined && {
          pd: pd !== null && pd !== '' ? parseFloat(pd) : null,
        }),
        ...(odAdd !== undefined && {
          odAdd: odAdd !== null && odAdd !== '' ? parseFloat(odAdd) : null,
        }),
      },
    });

    // Create notification for the patient
    await prisma.notification.create({
      data: {
        userId: prescription.patientId,
        title:
          status === 'VALIDATED'
            ? 'Prescription Validated'
            : 'Prescription Rejected',
        message:
          status === 'VALIDATED'
            ? 'Your prescription has been validated successfully by the optician.'
            : `Your prescription validation request was rejected by the optician. Reason: ${rejectionReason || 'Please upload a clear image of your prescription slip.'}`,
        type:
          status === 'VALIDATED'
            ? 'PRESCRIPTION_VALIDATED'
            : 'PRESCRIPTION_REJECTED',
        relatedId: prescription.id,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating prescription status:', error);
    res
      .status(500)
      .json({ error: 'Server error updating prescription status.' });
  }
});

// Configure multer storage for uploaded prescription images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'prescription-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) {
      return cb(
        new Error('Only image files (.png, .jpg, .jpeg, .webp) are allowed.'),
      );
    }
    cb(null, true);
  },
});

// POST /api/prescriptions/scan
// Upload an image of a prescription and extract values locally using Tesseract.js
router.post(
  '/scan',
  (req, res, next) => {
    upload.single('prescription')(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  async (req, res) => {
    if (!req.file) {
      return res
        .status(400)
        .json({ error: 'Please upload a prescription image file.' });
    }

    try {
      const imagePath = `/uploads/${req.file.filename}`;
      const fullPath = req.file.path;

      // Pre-process image: resize intelligently so payload stays well under OCR.space 1MB limit
      try {
        const image = await Jimp.read(fullPath);
        let targetW = image.bitmap.width;
        let targetH = image.bitmap.height;

        // Capping dimensions to optimal OCR size (max width 1600px, min width 1000px if small)
        if (targetW < 800) {
          const scale = 1.5;
          targetW = Math.round(targetW * scale);
          targetH = Math.round(targetH * scale);
        } else if (targetW > 1600) {
          const ratio = 1600 / targetW;
          targetW = 1600;
          targetH = Math.round(targetH * ratio);
        }

        const scaled = image.resize({ w: targetW, h: targetH });
        const whiteBg = new Jimp({
          width: scaled.bitmap.width,
          height: scaled.bitmap.height,
          color: 0xffffffff,
        });
        whiteBg.composite(scaled, 0, 0);
        await whiteBg.write(fullPath);
        console.log(`Pre-processed image using Jimp to ${targetW}x${targetH}.`);
      } catch (jimpErr) {
        console.warn('Image pre-processing skipped/failed:', jimpErr.message);
      }

      const imageBuffer = fs.readFileSync(fullPath);
      const ext = path.extname(req.file.originalname).toLowerCase().replace('.', '');
      const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
      const base64Image = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;

      // 0. Primary AI Vision Attempt: Gemini AI Multimodal (If API Key Present)
      const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
      if (geminiApiKey) {
        console.log('Attempting high-precision Gemini AI Multimodal Vision extraction...');
        try {
          const genAI = new GoogleGenerativeAI(geminiApiKey);
          const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

          const prompt = `You are a specialized optical prescription reader AI. Analyze this optical prescription image or doctor slip and extract the exact prescription parameters.
Return ONLY valid JSON matching this exact structure with no markdown or formatting wrapper:
{
  "od": { "sphere": "-2.50", "cyl": "-0.75", "axis": "90" },
  "os": { "sphere": "-2.25", "cyl": "-1.00", "axis": "95" },
  "pd": "63",
  "doctor": "Dr. Sarah Perera",
  "date": "2026-08-25"
}
Rules:
- OD is Right Eye, OS is Left Eye.
- SPH and CYL values MUST include positive (+) or negative (-) signs with two decimal places (e.g. "+1.50" or "-2.00").
- If CYL or AXIS are not present or blank, set them to null.
- If PD is missing, set to null.
- Return ONLY the JSON object.`;

          const imagePart = {
            inlineData: {
              data: imageBuffer.toString('base64'),
              mimeType: mimeType,
            },
          };

          const result = await model.generateContent([prompt, imagePart]);
          const responseText = result.response.text();
          console.log('--- GEMINI AI VISION RESPONSE ---');
          console.log(responseText);

          const cleanJsonStr = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
          const parsedAi = JSON.parse(cleanJsonStr);

          parsedAi.rawOcrResult = responseText;
          parsedAi.imageUrl = imagePath;

          return res.json(parsedAi);
        } catch (geminiErr) {
          console.warn('Gemini AI Vision skipped/failed, falling back to OCR:', geminiErr.message);
        }
      }

      // Pre-process image: resize intelligently so payload stays well under OCR.space 1MB limit
      try {
        const image = await Jimp.read(fullPath);
        let targetW = image.bitmap.width;
        let targetH = image.bitmap.height;

        if (targetW < 800) {
          const scale = 1.5;
          targetW = Math.round(targetW * scale);
          targetH = Math.round(targetH * scale);
        } else if (targetW > 1600) {
          const ratio = 1600 / targetW;
          targetW = 1600;
          targetH = Math.round(targetH * ratio);
        }

        const scaled = image.resize({ w: targetW, h: targetH });
        const whiteBg = new Jimp({
          width: scaled.bitmap.width,
          height: scaled.bitmap.height,
          color: 0xffffffff,
        });
        whiteBg.composite(scaled, 0, 0);
        await whiteBg.write(fullPath);
        console.log(`Pre-processed image using Jimp to ${targetW}x${targetH}.`);
      } catch (jimpErr) {
        console.warn('Image pre-processing skipped/failed:', jimpErr.message);
      }

      let rawText = '';

      // Secondary Attempt: OCR.space Cloud API
      try {
        const apiKey = process.env.OCR_SPACE_API_KEY || 'helloworld';

        const callOcrSpace = async (engine) => {
          const formData = new FormData();
          formData.append('apikey', apiKey);
          formData.append('base64Image', base64Image);
          formData.append('language', 'eng');
          formData.append('isTable', 'true');
          formData.append('ocrEngine', engine);
          formData.append('scale', 'true');

          const response = await fetch('https://api.ocr.space/parse/image', {
            method: 'POST',
            body: formData,
          });

          return await response.json();
        };

        let ocrData = await callOcrSpace('2');

        if (!ocrData || ocrData.OCRExitCode !== 1 || ocrData.error) {
          console.warn('OCR Engine 2 notice:', JSON.stringify(ocrData));
          ocrData = await callOcrSpace('1');
        }

        if (ocrData && ocrData.OCRExitCode === 1 && ocrData.ParsedResults?.[0]?.ParsedText) {
          rawText = ocrData.ParsedResults[0].ParsedText;
          console.log('--- OCR.SPACE TEXT RECEIVED ---');
        } else {
          console.warn('OCR.space API unavailable or throttled:', JSON.stringify(ocrData));
        }
      } catch (ocrErr) {
        console.warn('OCR.space network call failed:', ocrErr.message);
      }

      // Tertiary Fallback Attempt: Local Tesseract.js Engine
      if (!rawText || !rawText.trim()) {
        console.log('Using local Tesseract.js OCR engine fallback...');
        try {
          const tesseractResult = await Tesseract.recognize(fullPath, 'eng');
          rawText = tesseractResult?.data?.text || '';
          console.log('--- TESSERACT.JS LOCAL TEXT RECEIVED ---');
        } catch (tessErr) {
          console.error('Tesseract.js OCR Error:', tessErr.message);
        }
      }

      if (!rawText || !rawText.trim()) {
        throw new Error('Unable to extract text from prescription. Please ensure the image is clear and well-lit.');
      }

      console.log('--- RAW OCR TEXT START ---');
      console.log(rawText);
      console.log('--- RAW OCR TEXT END ---');

      // Run the enhanced heuristic parser
      const parsedData = parsePrescriptionText(rawText);

      // Attach raw text and local file path to the response
      parsedData.rawOcrResult = rawText;
      parsedData.imageUrl = imagePath;

      res.json(parsedData);
    } catch (error) {
      console.error('Prescription Scanning Error:', error);
      res.status(500).json({
        error: 'Failed to process prescription scan: ' + error.message,
      });
    }
  },
);

// Advanced Heuristic & Pattern Parser for Optical Prescriptions
function parsePrescriptionText(rawText) {
  const result = {
    od: { sphere: null, cyl: null, axis: null },
    os: { sphere: null, cyl: null, axis: null },
    pd: null,
    doctor: null,
    date: null,
  };

  if (!rawText) return result;

  // Clean common OCR character confusions in numeric context
  const cleanedText = rawText
    .replace(/(\d)[oO](\d)/g, '$10$2')
    .replace(/(\d)[oO]\b/g, '$10')
    .replace(/(\d)[lI](\d)/g, '$11')
    .replace(/(\d)[lI]\b/g, '$11')
    .replace(/°/g, ' ');

  const lines = cleanedText
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  // Helper to extract numbers with signs (+ / -) or decimals
  const parseNumbers = (str) => {
    // Strip line index prefixes like "1." or "2." at start of line
    const sanitized = str.replace(/^\s*\d+[\.\)]\s*/, '');

    // Replace optical label words (sph, cyl, axis, add, ds, dc, deg, mm, etc.)
    const numPart = sanitized
      .replace(/\b(sph|cyl|axis|add|ds|dc|deg|dp|mm|right|left|eye|od|os)\b/gi, ' ')
      .replace(/[x@,/]/g, ' ');

    const matches = numPart.match(/[-+]?\d+(?:\.\d+)?/g) || [];
    return matches.map(Number);
  };

  const formatDiopter = (num, isAxis = false) => {
    if (num === null || num === undefined || isNaN(num)) return null;
    if (isAxis) {
      return String(Math.round(Math.abs(num)));
    }
    // Handle OCR missing decimal point (e.g. 250 -> 2.50)
    if (Math.abs(num) >= 100 && Math.abs(num) <= 2500 && Math.floor(num) === num) {
      num = num / 100;
    }
    const str = num.toFixed(2);
    return num > 0 ? `+${str}` : str;
  };

  let odLine = '';
  let osLine = '';

  for (const line of lines) {
    const lower = line.toLowerCase();
    const isRight =
      /\b(o\.?d\.?|right|r\.?e\.?)\b/.test(lower) ||
      /^r\b/.test(lower) ||
      /^re\b/.test(lower) ||
      lower.includes('right eye');

    const isLeft =
      /\b(o\.?s\.?|left|l\.?e\.?)\b/.test(lower) ||
      /^l\b/.test(lower) ||
      /^le\b/.test(lower) ||
      lower.includes('left eye');

    if (isRight && !odLine) odLine = line;
    if (isLeft && !osLine) osLine = line;
  }

  if (odLine) {
    const nums = parseNumbers(odLine);
    if (nums.length >= 1) result.od.sphere = formatDiopter(nums[0]);
    if (nums.length >= 2) result.od.cyl = formatDiopter(nums[1]);
    if (nums.length >= 3) result.od.axis = formatDiopter(nums[2], true);
  }

  if (osLine) {
    const nums = parseNumbers(osLine);
    if (nums.length >= 1) result.os.sphere = formatDiopter(nums[0]);
    if (nums.length >= 2) result.os.cyl = formatDiopter(nums[1]);
    if (nums.length >= 3) result.os.axis = formatDiopter(nums[2], true);
  }

  // Fallback: Grid or Sequential lines if explicit OD/OS lines not matched separately
  if (!result.od.sphere && !result.os.sphere) {
    const numericLines = [];
    for (const line of lines) {
      const lower = line.toLowerCase();
      if (lower.includes('pd') || lower.includes('date') || lower.includes('dr.')) continue;
      const nums = parseNumbers(line);
      if (nums.length >= 1 && nums.some((n) => Math.abs(n) <= 25)) {
        numericLines.push(nums);
      }
    }

    if (numericLines.length >= 1) {
      const r1 = numericLines[0];
      if (r1.length >= 1) result.od.sphere = formatDiopter(r1[0]);
      if (r1.length >= 2) result.od.cyl = formatDiopter(r1[1]);
      if (r1.length >= 3) result.od.axis = formatDiopter(r1[2], true);
    }
    if (numericLines.length >= 2) {
      const r2 = numericLines[1];
      if (r2.length >= 1) result.os.sphere = formatDiopter(r2[0]);
      if (r2.length >= 2) result.os.cyl = formatDiopter(r2[1]);
      if (r2.length >= 3) result.os.axis = formatDiopter(r2[2], true);
    }
  }

  // Extract Pupillary Distance (PD)
  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.includes('pd') || lower.includes('pupil') || lower.includes('dist')) {
      const nums = parseNumbers(line).filter((n) => n >= 40 && n <= 85);
      if (nums.length > 0) result.pd = String(Math.round(nums[0]));
    }
  }

  // Extract Doctor & Date
  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.includes('dr') || lower.includes('doctor') || lower.includes('optometrist') || lower.includes('prescribed')) {
      const docLabelMatch = line.match(/(?:doctor(?:\s+name)?|optometrist|prescribed\s+by)\s*[:\-]\s*(?:dr\.?\s*)?([a-z\s.]+)/i);
      if (docLabelMatch && docLabelMatch[1] && docLabelMatch[1].trim() && docLabelMatch[1].trim().toLowerCase() !== 'name') {
        let name = docLabelMatch[1].trim().replace(/\b[a-z]/g, (l) => l.toUpperCase());
        if (!name.toLowerCase().startsWith('dr')) {
          name = 'Dr. ' + name;
        }
        result.doctor = name;
        break;
      }
      const drMatch = line.match(/\b(?:dr\.?)\s+([a-z\s.]+)/i);
      if (drMatch && drMatch[1]) {
        let name = drMatch[1].trim().replace(/\b[a-z]/g, (l) => l.toUpperCase());
        result.doctor = 'Dr. ' + name;
        break;
      }
    }
    if (lower.includes('date')) {
      const match =
        line.match(/\d{4}[-/.]\d{1,2}[-/.]\d{1,2}/) || line.match(/\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}/);
      if (match) result.date = match[0];
    }
  }

  return result;
}

export default router;
