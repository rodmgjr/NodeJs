const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const attendanceSchema = new Schema ({
    timeIn:{
        type: Date,
        required: true
    },
    timeOut:{
        type: Date,
        required: true
    },
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' }
});

module.exports = mongoose.model('Attendance', attendanceSchema);