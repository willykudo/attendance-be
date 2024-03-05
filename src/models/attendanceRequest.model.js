import mongoose from 'mongoose';

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
    organizationID: {
      type: String,
      required: true,
    },
    attendanceID: {
      type: String,
      ref: 'Attendances',
    },
    employeeID: {
      type: String,
      required: true,
    },
    punchIn: {
      type: Date,
      required: true,
    },
    punchOut: {
      type: Date,
      required: true,
    },
    notes: {
      type: String,
    },
    approvalStatus: {
      isHr: {
        status: {
          enum: ['Pending', 'Approved', 'Rejected'],
          type: String,
          default: 'Pending',
        },
        comment: {
          type: String,
        },
      },
      isManager: {
        status: {
          enum: ['Pending', 'Approved', 'Rejected'],
          type: String,
          default: 'Pending',
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
  'AttendanceRequest',
  attendanceRequestSchema
);

export default AttendanceRequestModel;
