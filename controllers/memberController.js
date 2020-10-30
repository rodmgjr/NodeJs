const MemberModel = require('../models/memberModel');
const AttendanceModel = require('../models/attendanceModel');

exports.getAllMembers = async (req, res) => {
  const membersInfo = await MemberModel.find({});

  res.send(membersInfo);
};

exports.getMemberSearch = async (req, res) => {

  const name = req.query.name;
  const status = req.query.status;
  const query = { name: name, status: status };
  const memberInfo = await MemberModel.findOne(query)
  res.send(memberInfo);
};

exports.getMemberById = async (req, res) => {
  const memberId = req.params.id;

  const member = await MemberModel.findById(memberId)
    .populate({
      path: 'eventsAttendance',
      select: { timeIn: 1, timeOut: 1, _id: 0 },
      populate: {
        path: 'eventId',
        select: { eventName: 1, _id: 0 }
      }

    });


  res.send(member);
};

exports.insertMember = async (req, res) => {
  try {
    const member = new MemberModel(req.body);

    await member.save();
    res.sendStatus(201);

  } catch (e) {
    next(e)
  }
};

exports.updateMember = async (req, res, next) => {
  try {
    const memberId = req.params.id;
    const memberInfo = req.body

    await MemberModel.findByIdAndUpdate(memberId, memberInfo);
    res.sendStatus(200);
  } catch (e) {
    next(e);
  }
};

exports.deleteMember = async (req, res, next) => {
  try {
    const MemberId = req.params.id;
    const Attendance = await AttendanceModel.find({ memberId: MemberId });
    if (Number(Attendance.length.toString()) === 0) {
      await MemberModel.findByIdAndDelete(MemberId);
    } else {
      throw new Error('Still have an Attendance');
    }
    res.sendStatus(200);
  } catch (e) {
    next(e)
  }
};
