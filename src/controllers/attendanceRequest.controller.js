import AttendanceRequestModel from "../models/attendanceRequest.model.js";
import AttendancesModel from "../models/attendances.model.js";
import BaseController from "./base.controller.js";

import { customizeError } from "../utils/common.js";

class AttendanceRequestController extends BaseController {
  constructor() {
    super(AttendanceRequestModel);
  }

  async create_request(req, res, next) {
    try {
      const attendanceRecord = await AttendancesModel.findOne({
        employeeID: req.body.employeeID,
        punchIn: req.body.punchInDate,
        punchOut: req.body.punchOutDate,
      });

      if (!attendanceRecord) {
        throw customizeError(400, "Attendance record not found");
      }

      const newData = new AttendanceRequestModel({
        ...req.body,
        attendanceID: attendanceRecord.uId,
        scheduleID: attendanceRecord.scheduleID,
      });

      const createdData = await newData.save();

      console.log(createdData);

      if (!createdData) {
        throw customizeError(400, "Create data failed");
      }

      return res.status(200).json({ data: createdData });
    } catch (error) {
      next(error);
    }
  }

  async get_by_id(req, res, next) {
    const { id } = req.params;

    try {
      const attendanceRecord = await AttendanceRequestModel.findOne({
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
        await AttendanceRequestModel.findOneAndUpdate(
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
}

const attendanceRequestController = new AttendanceRequestController();

export default attendanceRequestController;
