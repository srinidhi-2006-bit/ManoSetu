
const Booking = require('../models/Booking');

exports.createBooking = async (req, res) => {
    try {
        const { name, date, sessionType, stressLevel } = req.body;
        const booking = new Booking({
            userId: req.user.id,
            userName: name || req.user.username,
            date,
            sessionType,
            stressLevel
        });
        await booking.save();
        res.status(201).json({ success: true, message: 'Booking confirmed!', booking });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to create booking.' });
    }
};

exports.getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user.id });
        res.json({ success: true, bookings });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to fetch bookings.' });
    }
};
