/**
 * ManoSetu - Therapist Controller (Mongoose)
 */

const Therapist = require('../models/Therapist');
const Booking = require('../models/Booking');

// GET /api/therapists
const getTherapists = async (req, res, next) => {
  try {
    const { tag, search } = req.query;

    let query = {};

    if (tag) {
      query.tags = { $regex: new RegExp(tag, 'i') };
    }

    if (search) {
      query.$or = [
        { name: { $regex: new RegExp(search, 'i') } },
        { specialization: { $regex: new RegExp(search, 'i') } }
      ];
    }

    const therapists = await Therapist.find(query);

    res.json({ success: true, count: therapists.length, therapists });
  } catch (error) {
    next(error);
  }
};

// GET /api/therapists/:id
const getTherapistById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const therapist = await Therapist.findById(id);
    
    if (!therapist) return res.status(404).json({ success: false, error: 'Therapist not found.' });
    
    res.json({ success: true, therapist });
  } catch (error) {
    next(error);
  }
};

// POST /api/therapists/:id/book
const bookSession = async (req, res, next) => {
  try {
    const therapistId = req.params.id;
    const { preferredDate, preferredTime } = req.body;
    const userId = req.user?.id || 'anonymous';

    const therapist = await Therapist.findById(therapistId);
    if (!therapist) return res.status(404).json({ success: false, error: 'Therapist not found.' });

    const booking = await Booking.create({
      userId,
      therapistId,
      therapistName: therapist.name,
      preferredDate: preferredDate || 'TBD',
      preferredTime: preferredTime || 'TBD',
      status: 'PENDING'
    });

    console.log(`📅 Booking request: ${therapist.name} by user ${userId}`);

    res.status(201).json({
      success: true,
      message: `Booking request sent to ${therapist.name}. They will confirm shortly.`,
      bookingId: booking._id,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTherapists, getTherapistById, bookSession };
