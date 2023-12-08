import AttendancesModel from "../models/attendances.model.js";
import BaseController from "./base.controller.js";
import { customizeError } from "../utils/common.js";

import mockData from "../utils/mockData.js";

class AttendancesController extends BaseController {
  constructor() {
    super(AttendancesModel);
  }

  async punch_in(req, res, next) {
    try {
      const mockDataResult = await mockData();

      const newData = {
        ...req.body,
        employeeID: mockDataResult[0].employee.employee1.employeeID,
        scheduleID: mockDataResult[1].schedules.morning.uId,
        organizationID: mockDataResult[2].company.uId,
        location: mockDataResult[2].company.location,
        name: mockDataResult[0].employee.employee1.name,
        position: mockDataResult[0].employee.employee1.position,
        department: mockDataResult[0].employee.employee1.department,
        punchIn: new Date(),
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
        message: "Return from break recorded successfully",
        return: lastReturn,
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

  async get_by_query(req, res, next) {
    try {
      const { name, location, department } = req.query;
      const query = {};

      if (name) query.name = name;
      if (location) query.location = location;
      if (department) query.department = department;

      if (!query) {
        throw customizeError(400, "Invalid query parameters");
      }

      const attendances = await AttendancesModel.find(query);

      if (!attendances || attendances.length === 0) {
        throw customizeError(400, "Attendance record not found");
      }

      res.status(200).json({ attendances });
    } catch (error) {
      next(error);
    }
  }
}

const attendancesController = new AttendancesController();
export default attendancesController;
