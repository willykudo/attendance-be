import mongoose from "mongoose";

import { v4 } from "uuid";

const attendanceRequestSchema = mongoose.Schema(
  {
    uId: {
      type: String,
      required: true,
      unique: true,
      default: v4(),
    },
    scheduleID: {
      type: String,
      required: true,
    },
    attendanceID: {
      type: String,
      required: true,
    },
    punchInDate: {
      type: Date,
      required: true,
    },
    punchOutDate: {
      type: Date,
      required: true,
    },
    punchInTime: {
      type: Date,
      required: true,
    },
    punchOutTime: {
      type: Date,
      required: true,
    },
    notes: {
      type: String,
    },
    status: {
      type: String,
      default: "Pending",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const AttendanceRequestModel = mongoose.model(
  "AttendanceRequest",
  attendanceRequestSchema
);

export default AttendanceRequestModel;
