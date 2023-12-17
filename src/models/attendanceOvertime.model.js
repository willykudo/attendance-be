import mongoose from "mongoose";

const attendanceOvertimeSchema = mongoose.Schema(
  {
    uId: {
      type: String,
      required: true,
      unique: true,
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
