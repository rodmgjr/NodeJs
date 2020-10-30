const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const eventSchema = new Schema ({
    eventName:{
        type: String,
        required: true
    },
    eventType:{
        type: String,
        required: true
    },
    startDateTime:{
        type: Date,
        required: true
    },
    endDateTime:{
        type: Date,
        required: true
    },
    membersAttendance: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Attendance' }] 
});

module.exports = mongoose.model('Event', eventSchema);