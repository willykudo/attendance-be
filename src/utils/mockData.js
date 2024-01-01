const attendanceSetting = {
  uId: "uId",
  earlyPunchIn: 8,
  earlyPunchOut: 17,
  punchInDispen: 5,
  punchOutDispen: 10,
  dailyOvertime: 2,
  weeklyOvertime: 10,
  overtimeRounding: [
    {
      from: 1,
      to: 5,
      equal: 5,
    },
    {
      from: 6,
      to: 10,
      equal: 10,
    },
  ],
  overtimeMultipler: [
    {
      from: 1,
      to: 5,
      equal: 1.5,
    },
    {
      from: 6,
      to: 10,
      equal: 2,
    },
  ],
};

const punch_in = {
  uId: "uId",
  punchIn: "punchIn Date",
  employeeID: "employeeID",
  scheduleID: "scheduleID",
  organizationID: "organizationID",
  position: "position",
  location: "location",
  department: "jembut",
  punchInImage: "https://your-s3-bucket-url/th.jpg",
};

const mockedDataRes = {
  uId: "test",
  scheduleID: "test",
  attendanceID: "test",
  punchIn: "test",
  punchOut: "test",
  notes: "test",
  approvalStatus: {
    isHr: {
      status: "Pending",
      comment: "test",
    },
    isManager: {
      status: "Pending",
      comment: "test",
    },
  },
};

module.exports = {
  attendanceSetting,
  punch_in,
  mockedDataRes,
};
