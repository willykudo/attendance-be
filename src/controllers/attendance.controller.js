import AttendancesModel from "../models/attendances.model.js";
import BaseController from "./base.controller.js";
import { customizeError } from "../utils/common.js";

import mockData from "../utils/mockData.js";
import { uploadFile } from "../utils/aws.js";

class AttendancesController extends BaseController {
  constructor() {
    super(AttendancesModel);
  }

  async punch_in(req, res, next) {
    try {
      const mockDataResult = await mockData();

      const upload = await uploadFile(req.file);

      const lastAttendance = await AttendancesModel.findOne({
        employeeID: mockDataResult[0].employee.employee3.employeeID, // in the future use employeeID from the token
      }).sort({ punchIn: -1 });

      if (lastAttendance && !lastAttendance.punchOut) {
        throw customizeError(
          400,
          "Cannot punch in. Last record doesn't have a punch out."
        );
      }

      const newData = {
        ...req.body,
        employeeID: mockDataResult[0].employee.employee3.employeeID,
        scheduleID: mockDataResult[1].schedules.morning.uId,
        organizationID: mockDataResult[2].company.uId,
        location: mockDataResult[2].company.location,
        position: mockDataResult[0].employee.employee3.position,
        department: mockDataResult[0].employee.employee3.department,
        punchIn: new Date(),
        punchInImage: upload.Location,
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
      const upload = await uploadFile(req.file);

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
      attendanceRecord.punchOutImage = upload.Location;

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
      const upload = await uploadFile(req.file);

      const attendanceRecord = await AttendancesModel.findOne({ uId: id });
      const lastReturn =
        attendanceRecord.breaks[attendanceRecord.breaks.length - 1];

      const newBreak = {
        ...req.body,
        breakTime: new Date(),
        breakImage: upload.Location,
      };

      // If there are no breaks or the last break has a returnFromBreak, allow the break
      if (!attendanceRecord.breaks.length || lastReturn.returnFromBreak) {
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
      } else {
        throw customizeError(
          400,
          "Can't add break, please return from break first"
        );
      }
    } catch (error) {
      next(error);
    }
  }

  async return_from_break(req, res, next) {
    const { id } = req.params;

    try {
      const attendanceRecord = await AttendancesModel.findOne({ uId: id });
      const upload = await uploadFile(req.file);

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
      lastReturn.returnImage = upload.Location;

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
