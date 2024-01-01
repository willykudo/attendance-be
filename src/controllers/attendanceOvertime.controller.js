import AttendanceOvertime from "../models/attendanceOvertime.model.js";
import AttendanceModel from "../models/attendances.model.js";
import BaseController from "./base.controller.js";

import { v4 } from "uuid";

class AttendanceOvertimeController extends BaseController {
  constructor() {
    super(AttendanceOvertime);
  }

  async create_overtime(req, res, next) {
    try {
      const { attendanceID, employeeID } = req.body;
      const attendanceRecord = await AttendanceModel.findOne({
        uId: attendanceID,
        employeeID: employeeID,
      });

      const punchOut = new Date(attendanceRecord.punchOut);
      const punchIn = new Date(attendanceRecord.punchIn);

      const totalHoursWorked = Number(
        ((punchOut - punchIn) / (1000 * 60 * 60)).toFixed(1)
      );

      const newData = {
        ...req.body,
        uId: v4(),
        overtimeDuration: totalHoursWorked,
        overtimeDate: attendanceRecord.createdAt,
      };

      const createdData = await AttendanceOvertime.create(newData);

      if (!createdData) {
        throw customizeError(400, "Create data failed");
      }

      return res.status(201).json({
        data: createdData,
      });
    } catch (error) {
      next(error);
    }
  }

  async get_by_query(req, res, next) {
    try {
      const projection = {
        $project: {
          _id: 0,
          uId: 1,
          attendanceID: 1,
          overtimeDuration: 1,
          overtimeDate: 1,
          notes: 1,
          approvalStatus: 1,
          "attendanceDetails.location": 1,
          "attendanceDetails.department": 1,
        },
      };

      const pipeline = [
        {
          $lookup: {
            from: "attendances",
            localField: "attendanceID",
            foreignField: "uId",
            as: "attendanceDetails",
          },
        },
        {
          $match: {
            "attendanceDetails.location": {
              $regex: new RegExp(req.query.location, "i"),
            },
            "attendanceDetails.department": {
              $regex: new RegExp(req.query.department, "i"),
            },
          },
        },
        projection,
      ];

      if (req.query.skip) {
        pipeline.push({ $skip: parseInt(req.query.skip) });
      }

      if (req.query.limit) {
        pipeline.push({ $limit: parseInt(req.query.limit) });
      }

      const result = await AttendanceOvertime.aggregate(pipeline);

      return res.status(200).json({
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async update_status(req, res, next) {
    const { id } = req.params;
    const { isHr, isManager } = req.body;

    try {
      let updateFields = {};

      if (isHr) {
        updateFields["approvalStatus.isHr.status"] = isHr.status || "Pending";
        updateFields["approvalStatus.isHr.comment"] = isHr.comment || "";
      }

      if (isManager) {
        updateFields["approvalStatus.isManager.status"] =
          isManager.status || "Pending";
        updateFields["approvalStatus.isManager.comment"] =
          isManager.comment || "";
      }

      const updatedAttendanceRequest =
        await AttendanceOvertime.findOneAndUpdate(
          { uId: id },
          { $set: updateFields },
          { new: true, runValidators: true }
        );

      if (!updatedAttendanceRequest) {
        throw customizeError(404, "Attendance request not found");
      }

      res.status(200).json({
        message: "Approval status updated successfully",
        data: updatedAttendanceRequest,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete_by_id(req, res, next) {
    const { id } = req.params;
    try {
      const result = await AttendanceOvertime.findOneAndDelete({
        uId: id,
      });

      if (!result) {
        throw customizeError(404, "Overtime record not found");
      }

      res.status(200).json({
        message: "Attendance request deleted successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async get_by_id(req, res, next) {
    const { id } = req.params;

    try {
      const attendanceRecord = await AttendanceOvertime.findOne({
        uId: id,
      });

      if (!attendanceRecord) {
        throw customizeError(400, "Attendance record not found");
      }

      res.status(200).json({ data: attendanceRecord });
    } catch (error) {
      next(error);
    }
  }
}

const attendanceOvertime = new AttendanceOvertimeController();
export default attendanceOvertime;
