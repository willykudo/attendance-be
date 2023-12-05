import mongoose from "mongoose";

import { v4 } from "uuid";

const attendanceSettingSchema = mongoose.Schema(
  {
    uId: {
      type: String,
      required: true,
      unique: true,
      default: v4(),
    },
    earlyPunchIn: {
      type: Number,
      required: true,
    },
    earlyPunchOut: {
      type: Number,
      required: true,
    },
    punchInDispen: {
      type: Number,
      required: true,
    },
    punchOutDispen: {
      type: Number,
      required: true,
    },
    dailyOvertime: {
      type: Number,
      required: true,
    },
    weeklyOvertime: {
      type: Number,
      required: true,
    },
    overtimeRounding: [
      {
        uId: {
          type: String,
          required: true,
        },
        from: {
          type: Number,
          required: true,
        },
        to: {
          type: Number,
          required: true,
        },
        equal: {
          type: Number,
          required: true,
        },
      },
    ],
    overtimeMultipler: [
      {
        uId: {
          type: String,
          required: true,
        },
        from: {
          type: Number,
          required: true,
        },
        to: {
          type: Number,
          required: true,
        },
        equal: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  { timestamps: true, versionKey: false }
);

const AttendanceSettingModel = mongoose.model(
  "AttendanceSetting",
  attendanceSettingSchema
);

export default AttendanceSettingModel;
