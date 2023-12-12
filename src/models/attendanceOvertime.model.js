import mongoose from "mongoose";

import { v4 } from "uuid";

const attendanceOvertimeSchema = mongoose.Schema(
  {
    uId: {
      type: String,
      required: true,
      unique: true,
      default: v4(),
    },
    attendanceID: {
      type: String,
      required: true,
      ref: "Attendances",
    },
    overtimeDuration: {
      type: Number,
      required: true,
    },
    overtimeDate: {
      type: Date,
      required: true,
    },
    notes: {
      type: String,
    },
    status: {
      isHr: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending",
      },
      isManager: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending",
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const AttendanceOvertime = mongoose.model(
  "AttendanceOvertime",
  attendanceOvertimeSchema
);

export default AttendanceOvertime;
