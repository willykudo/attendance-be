import mongoose from "mongoose";

const attendanceRequestSchema = mongoose.Schema(
  {
    uId: {
      type: String,
      required: true,
      unique: true,
    },
    scheduleID: {
      type: String,
      required: true,
    },
    attendanceID: {
      type: String,
      required: true,
      ref: "Attendances",
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

const AttendanceRequestModel = mongoose.model(
  "AttendanceRequest",
  attendanceRequestSchema
);

export default AttendanceRequestModel;
