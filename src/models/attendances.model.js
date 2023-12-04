import mongoose from "mongoose";

const attendanceSchema = mongoose.Schema(
  {
    uId: {
      type: String,
      required: true,
      unique: true,
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
          type: Buffer,
        },
        returnImage: {
          type: Buffer,
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
      type: Buffer,
    },
    punchOutImage: {
      type: Buffer,
    },
    punchInDesc: {
      type: String,
    },
    punchOutDesc: {
      type: String,
    },
    status: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionkey: false,
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

// type: mongoose.Schema.Types.ObjectId,
//       required: true,
//       ref: "Organization",
