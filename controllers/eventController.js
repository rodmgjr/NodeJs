const AttendanceModel = require('../models/attendanceModel');
const EventModel = require('../models/eventModel');
const XLSX = require('XLSX');

exports.getAll = async (req, res) => {
  const events = await EventModel.find({});

  res.send(events);
};

exports.getEventById = async (req, res) => {
  const EventId = req.params.id;

  const event = await EventModel.findById(EventId)
    .populate({
      path: 'membersAttendance',
      select: { timeIn: 1, timeOut: 1, _id: 0 },
      populate: {
        path: 'memberId',
        select: { name: 1, status: 1, _id: 0 }
      }
    });

  res.send(event);
};

exports.getEventSearch = async (req, res) => {

  const eventName = req.query.eventName;
  const startDateTime = req.query.startDateTime;
  const endDateTime = req.query.endDateTime;
  const query = { eventName: eventName, startDateTime: startDateTime, endDateTime: endDateTime };
  const eventInfo = await EventModel.findOne(query)
  res.send(eventInfo);
};

exports.getEventExport = async (req, res) => {
  const eventId = req.query.eventId;
  const query = { _id: eventId };


  const eventInfo = await EventModel.findOne(query)
    .populate({
      path: 'membersAttendance',
      select: { timeIn: 1, timeOut: 1, _id: 1 },
      populate: {
        path: 'memberId',
        select: { name: 1, status: 1, _id: 1 }
      }
    }).lean();


  const members = eventInfo.membersAttendance.map(attendance => {
    const { timeIn, timeOut, memberId } = attendance;
    const { name } = memberId;
    return { timeIn, timeOut, name };
  });

  eventInfo.membersAttendance = members;

  const fileName = `${eventInfo.eventName}_${eventInfo.startDateTime}.xlsx`;
  const workBook = XLSX.utils.book_new();

  const workSheet = XLSX.utils.json_to_sheet(eventInfo.membersAttendance);

  XLSX.utils.book_append_sheet(workBook, workSheet, `${eventInfo.eventName}`);

  const writeOpts = { bookType: 'xlsx', bookSST: false, type: 'buffer' };

  const buffer = XLSX.write(workBook, writeOpts);

  res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.set('Content-Disposition', `attachment; filename=${fileName}`);
  res.status(200).send(buffer);
};

exports.insertEvent = async (req, res, next) => {
  try {
    const event = new EventModel(req.body);

    if (req.body.startDateTime > req.body.endDateTime) {
      throw new Error('Start date time should be less than to End date time');
    }

    await event.save();
    res.sendStatus(201);

  } catch (e) {
    next(e);
  }
};

exports.updateEvent = async (req, res, next) => {
  try {
    const EventId = req.params.id;

    if (req.body.startDateTime > req.body.endDateTime) {
      throw new Error('Start date time should be less than to End date time');
    }

    await EventModel.findByIdAndUpdate(EventId, req.body);

    res.sendStatus(200);
  } catch (e) {
    next(e);
  }
};

exports.deleteEvent = async (req, res, next) => {
  try {
    const EventId = req.params.id;
    const Attendance = await AttendanceModel.find({ eventId: EventId });
    if (Number(Attendance.length.toString()) === 0) {
      await EventModel.findByIdAndDelete(EventId);
    } else {
      throw new Error('Still have an Attendance');
    }
    res.sendStatus(200);
  } catch (e) {
    next(e)
  }
};
