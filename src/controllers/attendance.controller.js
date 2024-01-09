import AttendancesModel from "../models/attendances.model.js";
import BaseController from "./base.controller.js";
import { customizeError } from "../utils/common.js";

import { uploadFile } from "../utils/aws.js";
import { getDataById } from "../services/employee.js";

import { v4 } from "uuid";

class AttendancesController extends BaseController {
  constructor() {
    super(AttendancesModel);
  }

  async punch_in(req, res, next) {
    try {
      const upload = await uploadFile(req.file);

      const employeeID = req.user.uId;

      const lastAttendance = await AttendancesModel.find({
        employeeID: employeeID,
      }).sort({ punchIn: -1 });

      if (lastAttendance.length === 0) {
        const newData = {
          ...req.body,
          employeeID: employeeID,
          organizationID: req.user.organizationID,
          uId: v4(),
          punchIn: new Date(),
          punchInImage: upload.Location,
        };

        const createdData = await AttendancesModel.create(newData);

        return res.status(201).json({ data: createdData });
      } else if (!lastAttendance[0].punchOut) {
        throw customizeError(
          400,
          "Cannot punch in. Last record doesn't have a punch out."
        );
      }
    } catch (error) {
      next(error);
    }
  }

  async punch_out(req, res, next) {
    const employeeID = req.user.uId;

    try {
      const attendanceRecord = await AttendancesModel.findOne({
        employeeID: employeeID,
      });
      const upload = await uploadFile(req.file);

      if (!attendanceRecord) {
        throw customizeError(400, "Attendance record not found");
      }

      const lastReturn =
        attendanceRecord.breaks[attendanceRecord.breaks.length - 1];

      if (!lastReturn) {
        throw customizeError(
          400,
          "Cannot punch out. Last record doesn't have a break"
        );
      }

      if (!lastReturn.returnFromBreak) {
        throw customizeError(
          400,
          "Cannot punch out. Last record doesn't have a return from break"
        );
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

  async break(req, res, next) {
    const employeeID = req.user.uId;

    try {
      const upload = await uploadFile(req.file);

      const attendanceRecord = await AttendancesModel.findOne({
        employeeID: employeeID,
      });

      const lastRecord =
        attendanceRecord.breaks[attendanceRecord.breaks.length - 1];

      const newBreak = {
        ...req.body,
        breakTime: new Date(),
        breakImage: upload.Location,
      };

      if (!attendanceRecord.breaks.length || lastRecord.returnFromBreak) {
        const updatedAttendance = await AttendancesModel.findOneAndUpdate(
          { employeeID: employeeID },
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
    const employeeID = req.user.uId;

    try {
      const attendanceRecord = await AttendancesModel.findOne({
        employeeID: employeeID,
      });
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
    employeeID = req.user.uId;

    try {
      const attendanceRecord = await AttendancesModel.findOne({
        employeeID: employeeID,
      });

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
      const { location, department } = req.query;

      const query = {
        ...(location && { location }),
        ...(department && { department }),
      };

      const attendances = await AttendancesModel.find(query)
        .limit(req.query.limit ? req.query.limit : 0)
        .skip(req.query.skip ? req.query.skip : 0);

      if (!attendances || attendances.length === 0) {
        return res.status(400).json({ error: "Attendance record not found" });
      }

      res.status(200).json({ attendances });
    } catch (error) {
      next(error);
    }
  }

  async delete_by_id(req, res, next) {
    const { id } = req.params;
    try {
      const result = await AttendancesModel.findOneAndDelete({ uId: id });
      if (!result) {
        throw customizeError(400, "Delete data failed");
      }
      return res.status(200).json({ message: "Data deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}

const attendancesController = new AttendancesController();
export default attendancesController;
