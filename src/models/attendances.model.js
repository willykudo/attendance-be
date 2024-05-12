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
    employeeInfo: {
      firstName: {
        type: String,
      },
      lastName: {
        type: String,
      },
      jobLevel: {
        type: String,
      }
    },
    scheduleID: {
      type: String,
      required: true,
    },
    organizationID: {
      type: String,
      required: true,
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
      address: {
        type: String,
      },
      lat: {
        type: String,
      },
      long: {
        type: String,
      },
      postalCode: {
        type: String,
      },
    },
    punchOutGps: {
      address: {
        type: String,
      },
      lat: {
        type: String,
      },
      long: {
        type: String,
      },
      postalCode: {
        type: String,
      },
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
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const AttendancesModel = mongoose.model("Attendances", attendanceSchema);
export default AttendancesModel;