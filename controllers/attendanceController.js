const AttendanceModel = require('../models/attendanceModel');
const EventModel = require('../models/eventModel');
const MemberModel = require('../models/memberModel');

exports.getAll = async (req, res) => {
  const attendance = await AttendanceModel.find({});
  res.send(attendance);
};

exports.insertAttendance = async (req, res, next) => {
  try {
    const body = req.body;

    const attendance = new AttendanceModel(body);

    if (body.timeIn > body.timeOut) {
      throw new Error('Time In should be less than to Time Out');
    }

    const attendanceDataSave = await attendance.save();
    const attendanceId = attendanceDataSave._id;

    const eventData = await EventModel.findById(body.eventId);
    eventData.membersAttendance.push(attendanceId);

    const memberData = await MemberModel.findById(body.memberId);
    memberData.eventsAttendance.push(attendanceId);

    await eventData.save();
    await memberData.save();


    res.sendStatus(201);

  } catch (e) {
    next(e);
  }
};

exports.updateAttendance = async function (req, res, next) {
  try {
    const attendanceId = req.params.id;
    const body = req.body;

    if (req.body.startDateTime > req.body.endDateTime) {
      throw new Error('Time In should be less than to Time Out');
    }

    const oldAttendance = await AttendanceModel.findById(attendanceId);
    await AttendanceModel.findByIdAndUpdate(attendanceId, body); 

    if (oldAttendance.memberId != body.memberId) {
      const memberData = await MemberModel.findById(body.memberId);
      memberData.eventsAttendance.push(attendanceId);
      await memberData.save();

      await MemberModel.update(
        { _id: oldAttendance.memberId },
        { '$pull': { 'eventsAttendance': attendanceId } }
      );
    }

    if (oldAttendance.eventId != body.eventId) {
      const eventData = await EventModel.findById(body.eventId);
      eventData.membersAttendance.push(attendanceId);
      await eventData.save();
      
      await EventModel.update(
        { _id: oldAttendance.eventId },
        { '$pull': { 'membersAttendance': attendanceId } }
      );
    }

    res.sendStatus(200);
  } catch (e) {
    next(e);
  }
};

exports.deleteAttendance = async function (req, res, next) {
  try {
    const attendanceId = req.params.id;

    const oldAttendance = await AttendanceModel.findById(attendanceId);
    await AttendanceModel.findByIdAndDelete(attendanceId);

    await MemberModel.update(
      { _id: oldAttendance.memberId },
      { '$pull': { 'eventsAttendance': attendanceId } }
    );

    await EventModel.update(
      { _id: oldAttendance.eventId },
      { '$pull': { 'membersAttendance': attendanceId } }
    );

    res.sendStatus(200);
  } catch (e) {
    next(e);
  }
};