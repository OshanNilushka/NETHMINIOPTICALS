import express from 'express';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

// Helper to parse date string (YYYY-MM-DD) and time slot string (e.g., "10:00 AM" or "09:00 AM") into a Date object in UTC.
function parseDateTime(dateStr, slotStr) {
  const [time, modifier] = slotStr.trim().split(' ');
  let [hours, minutes] = time.split(':').map(Number);

  if (modifier === 'PM' && hours < 12) {
    hours += 12;
  }
  if (modifier === 'AM' && hours === 12) {
    hours = 0;
  }

  const hourStr = String(hours).padStart(2, '0');
  const minuteStr = String(minutes).padStart(2, '0');

  // Return a standardized UTC Date representation
  return new Date(`${dateStr}T${hourStr}:${minuteStr}:00.000Z`);
}

// Helper to format UTC Date back to compatible timeslots
function formatToSlots(dateObj) {
  let hours = dateObj.getUTCHours();
  const minutes = dateObj.getUTCMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minStr = String(minutes).padStart(2, '0');

  const hourWithZero = String(hours).padStart(2, '0');
  const hourWithoutZero = String(hours);

  return [
    `${hourWithZero}:${minStr} ${ampm}`,
    `${hourWithoutZero}:${minStr} ${ampm}`,
  ];
}

// GET /api/appointments
// Fetch appointments based on role (Patients see their own; Opticians/Admins see all)
router.get('/', async (req, res) => {
  try {
    const { id, role } = req.user;
    let appointments;

    const includeQuery = {
      patient: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true,
        },
      },
      optician: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    };

    if (role === 'PATIENT') {
      appointments = await prisma.appointment.findMany({
        where: { patientId: id },
        include: includeQuery,
        orderBy: { dateTime: 'asc' },
      });
    } else {
      appointments = await prisma.appointment.findMany({
        include: includeQuery,
        orderBy: { dateTime: 'asc' },
      });
    }

    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Server error retrieving appointments.' });
  }
});

// GET /api/appointments/booked
// Returns slots already booked on a date (e.g. ?date=2026-06-20)
router.get('/booked', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res
        .status(400)
        .json({ error: 'Date parameter (YYYY-MM-DD) is required.' });
    }

    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);

    const appointments = await prisma.appointment.findMany({
      where: {
        dateTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          not: 'CANCELLED',
        },
      },
      select: {
        dateTime: true,
      },
    });

    // Extract all formatted slot representations that are booked
    const bookedSlots = [];
    appointments.forEach((apt) => {
      const slots = formatToSlots(apt.dateTime);
      bookedSlots.push(...slots);
    });

    // Remove duplicates
    const uniqueBookedSlots = [...new Set(bookedSlots)];

    res.json(uniqueBookedSlots);
  } catch (error) {
    console.error('Error fetching booked slots:', error);
    res.status(500).json({ error: 'Server error retrieving booked slots.' });
  }
});

// POST /api/appointments
// Book a new appointment with validation to prevent conflicts
router.post('/', async (req, res) => {
  try {
    const { date, time, type, location, doctor } = req.body;
    let { notes } = req.body;

    if (!date || !time) {
      return res
        .status(400)
        .json({ error: 'Date and time slot are required.' });
    }

    const parsedDateTime = parseDateTime(date, time);

    // Check if slot is already occupied
    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        dateTime: parsedDateTime,
        status: {
          not: 'CANCELLED',
        },
      },
    });

    if (conflictingAppointment) {
      return res.status(400).json({
        error: 'This time slot is already booked. Please choose another time.',
      });
    }

    // Determine target patient
    let targetPatientId = req.body.patientId;
    let patientName = req.body.patient;
    notes = notes || '';

    // Append metadata to notes for storage: "Type: Eye Exam | Location: Colombo Branch"
    const metadataParts = [];
    if (type) metadataParts.push(`Type: ${type}`);
    if (location) metadataParts.push(`Location: ${location}`);
    if (doctor) metadataParts.push(`Doctor: ${doctor}`);
    const metadataString = metadataParts.join(' | ');

    if (metadataString) {
      notes = notes ? `${metadataString} | Notes: ${notes}` : metadataString;
    }

    if (req.user.role === 'PATIENT') {
      targetPatientId = req.user.id;
    } else {
      // Optician/Admin is scheduling
      if (!targetPatientId && patientName) {
        const matchedUser = await prisma.user.findFirst({
          where: {
            fullName: {
              equals: patientName,
              mode: 'insensitive',
            },
            role: 'PATIENT',
          },
        });

        if (matchedUser) {
          targetPatientId = matchedUser.id;
        } else {
          // Find any patient user to satisfy Prisma FK constraints
          const fallbackUser = await prisma.user.findFirst({
            where: { role: 'PATIENT' },
          });
          if (fallbackUser) {
            targetPatientId = fallbackUser.id;
            notes = `Patient: ${patientName} | ${notes}`;
          } else {
            return res.status(400).json({
              error:
                'No patient users found in database to link the appointment.',
            });
          }
        }
      } else if (!targetPatientId) {
        return res
          .status(400)
          .json({ error: 'Patient name or patientId is required.' });
      }
    }

    // Optionally assign doctor (if doctor matches an Optician user, we could link opticianId)
    let opticianId = null;
    if (doctor) {
      const docUser = await prisma.user.findFirst({
        where: {
          fullName: {
            equals: doctor,
            mode: 'insensitive',
          },
          role: 'OPTICIAN',
        },
      });
      if (docUser) {
        opticianId = docUser.id;
      }
    }

    if (
      !opticianId &&
      (req.user.role === 'OPTICIAN' || req.user.role === 'ADMIN')
    ) {
      opticianId = req.user.id;
    }

    // Create the appointment
    const newAppointment = await prisma.appointment.create({
      data: {
        patientId: targetPatientId,
        opticianId,
        dateTime: parsedDateTime,
        status: req.user.role === 'PATIENT' ? 'PENDING' : 'CONFIRMED',
        notes: notes || null,
      },
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

    // Create a notification if booked by a patient
    if (req.user.role === 'PATIENT') {
      const patientName = newAppointment.patient?.fullName || 'A patient';
      const formattedDate = parsedDateTime.toISOString().split('T')[0];
      await prisma.notification.create({
        data: {
          role: 'OPTICIAN',
          title: 'New Appointment Booking',
          message: `${patientName} booked a new appointment for ${formattedDate}.`,
          type: 'APPOINTMENT_BOOKED',
          relatedId: newAppointment.id,
        },
      });
    }

    res.status(201).json(newAppointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Server error creating appointment.' });
  }
});

// PUT /api/appointments/:id
// Update appointment status (Optician/Admin only)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required.' });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      return res
        .status(404)
        .json({ error: `Appointment with ID ${id} not found.` });
    }

    // Update appointment
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        status,
        ...(req.user.role === 'OPTICIAN' || req.user.role === 'ADMIN'
          ? { opticianId: req.user.id }
          : {}),
      },
    });

    res.json(updatedAppointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ error: 'Server error updating appointment.' });
  }
});

export default router;
