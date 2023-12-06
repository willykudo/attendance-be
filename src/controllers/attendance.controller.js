import AttendancesModel from "../models/attendances.model.js";
import BaseController from "./base.controller.js";
import { customizeError } from "../utils/common.js";

import { v4 } from "uuid";

import multer from "multer";

class AttendancesController extends BaseController {
  constructor() {
    super(AttendancesModel);
  }

  async punch_in(req, res, next) {
    try {
      const newData = {
        ...req.body,
        punchIn: new Date(),
        punchInImage: req.file ? req.file.buffer : undefined,
      };

      const createdData = await AttendancesModel.create(newData);

      if (!createdData) {
        throw customizeError(400, "Create data failed");
      }

      return res.status(200).json({ data: createdData });
    } catch (error) {
      next(error);
    }
  }

  async punch_out(req, res, next) {
    const { id } = req.params;

    try {
      const attendanceRecord = await AttendancesModel.findOne({ uId: id });

      if (!attendanceRecord) {
        throw customizeError(400, "Attendance record not found");
      }

      const punchInTime = attendanceRecord.punchIn;
      const punchOutTime = new Date();
      const totalHoursWorked = (punchOutTime - punchInTime) / (1000 * 60 * 60);

      const status = totalHoursWorked > 8 ? "overtime" : "late";

      attendanceRecord.punchOutDesc = req.body.punchOutDesc;
      attendanceRecord.punchOutGps = req.body.punchOutGps;
      attendanceRecord.punchOut = punchOutTime;
      attendanceRecord.status = status;

      await attendanceRecord.save();

      return res.status(200).json({ data: attendanceRecord });
    } catch (error) {
      next(error);
    }
  }

  // async punch_out(req, res, next) {
  //   const { id } = req.params;

  //   const upload = multer({
  //     limits: {
  //       fileSize: 1000000,
  //     },
  //     fileFilter(req, file, callback) {
  //       if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
  //         return callback(new Error("Please upload an image"));
  //       }

  //       callback(undefined, true);
  //     },
  //   }).single("punchOutImage");

  //   // Wrap the Multer middleware in a promise
  //   const uploadMiddleware = () => {
  //     return new Promise((resolve, reject) => {
  //       upload(req, res, (err) => {
  //         if (err) {
  //           reject(err);
  //         } else {
  //           resolve();
  //         }
  //       });
  //     });
  //   };

  //   try {
  //     // Use async/await with the simplified uploadMiddleware
  //     await uploadMiddleware();

  //     const attendanceRecord = await AttendancesModel.findOne({ uId: id });

  //     if (!attendanceRecord) {
  //       throw customizeError(400, "Attendance record not found");
  //     }

  //     const punchInTime = attendanceRecord.punchIn;
  //     const punchOutTime = new Date();
  //     const totalHoursWorked = (punchOutTime - punchInTime) / (1000 * 60 * 60);

  //     const status = totalHoursWorked > 8 ? "overtime" : "late";

  //     attendanceRecord.punchOutDesc = req.body.punchOutDesc;
  //     attendanceRecord.punchOutGps = req.body.punchOutGps;
  //     attendanceRecord.punchOut = punchOutTime;
  //     attendanceRecord.punchOutImage = req.file ? req.file.buffer : undefined;
  //     attendanceRecord.status = status;

  //     await attendanceRecord.save();

  //     return res.status(200).json({ data: attendanceRecord });
  //   } catch (error) {
  //     next(error);
  //   }
  // }

  async break(req, res, next) {
    const { id } = req.params;

    try {
      const newBreak = {
        ...req.body,
        breakTime: new Date(),
      };

      //insert the data to the breaks array
      const updatedAttendance = await AttendancesModel.findOneAndUpdate(
        { uId: id },
        { $push: { breaks: newBreak } },
        { new: true }
      );

      if (!updatedAttendance) {
        throw customizeError(400, "Attendance record not found");
      }

      res
        .status(200)
        .json({ message: "Break added successfully", break: newBreak });
    } catch (error) {
      next(error);
    }
  }

  async return_from_break(req, res, next) {
    const { id } = req.params;

    try {
      const attendanceRecord = await AttendancesModel.findOne({ uId: id });

      if (!attendanceRecord) {
        throw customizeError(400, "Attendance record not found");
      }

      const lastReturn =
        attendanceRecord.breaks[attendanceRecord.breaks.length - 1];

      if (lastReturn.returnFromBreak) {
        throw customizeError(400, "Return from break already recorded");
      }

      lastReturn.returnFromBreak = new Date();
      lastReturn.returnDesc = req.body.returnDesc;

      await attendanceRecord.save();

      res.status(200).json({
        message: "Return from break added successfully",
        break: {
          ...lastReturn,
          returnDesc: lastReturn.returnDesc,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async get_by_id(req, res, next) {
    const { id } = req.params;

    try {
      const attendanceRecord = await AttendancesModel.findOne({ uId: id });

      if (!attendanceRecord) {
        throw customizeError(400, "Attendance record not found");
      }

      res.status(200).json({ data: attendanceRecord });
    } catch (error) {
      next(error);
    }
  }
}

const attendancesController = new AttendancesController();
export default attendancesController;
