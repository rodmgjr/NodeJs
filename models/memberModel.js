const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const memberSchema = new Schema ({
    name:{
        type: String,
        required: true
    },
    status:{
        type: String,
        required: true
    },
    eventsAttendance: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Attendance' }]
});

module.exports = mongoose.model('Member', memberSchema);