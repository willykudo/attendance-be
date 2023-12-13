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
    approvalStatus: {
      isHr: {
        status: {
          enum: ["Pending", "Approved", "Rejected"],
          type: String,
          default: "Pending",
        },
        comment: {
          type: String,
        },
      },
      isManager: {
        status: {
          enum: ["Pending", "Approved", "Rejected"],
          type: String,
          default: "Pending",
        },
        comment: {
          type: String,
        },
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
