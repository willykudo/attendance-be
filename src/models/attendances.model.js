import mongoose from "mongoose";

import { v4 } from "uuid";

const attendanceSchema = mongoose.Schema(
  {
    uId: {
      type: String,
      required: true,
      unique: true,
      default: v4(),
    },
    employeeID: {
      type: String,
      required: true,
    },
    scheduleID: {
      type: String,
      required: true,
    },
    organizationID: {
      type: String,
      required: true,
    },
    name: {
      type: String,
    },
    position: {
      type: String,
    },
    location: {
      type: String,
    },
    department: {
      type: String,
    },
    punchIn: {
      type: Date,
    },
    punchOut: {
      type: Date,
    },
    breaks: [
      {
        breakTime: {
          type: Date,
        },
        returnFromBreak: {
          type: Date,
        },
        breakImage: {
          type: String,
        },
        returnImage: {
          type: String,
        },
        breakDesc: {
          type: String,
        },
        returnDesc: {
          type: String,
        },
      },
    ],
    punchInGps: {
      type: String,
    },
    punchOutGps: {
      type: String,
    },
    punchInImage: {
      type: String,
    },
    punchOutImage: {
      type: String,
    },
    punchInDesc: {
      type: String,
    },
    punchOutDesc: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

attendanceSchema.methods.toJSON = function () {
  const attendance = this;
  const attendanceObject = attendance.toObject();

  delete attendanceObject.punchInImage;
  delete attendanceObject.punchOutImage;

  // Loop through breaks array and delete breakImage and returnImage from each break
  attendanceObject.breaks.forEach((breakItem) => {
    delete breakItem.breakImage;
    delete breakItem.returnImage;
  });

  return attendanceObject;
};

const AttendancesModel = mongoose.model("Attendances", attendanceSchema);
export default AttendancesModel;
