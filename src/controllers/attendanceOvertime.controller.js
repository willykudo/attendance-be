import AttendanceOvertime from "../models/attendanceOvertime.model.js";
import AttendanceModel from "../models/attendances.model.js";
import BaseController from "./base.controller.js";

class AttendanceOvertimeController extends BaseController {
  constructor() {
    super(AttendanceOvertime);
  }

  async create_overtime(req, res, next) {
    try {
      const { attendanceID } = req.body;
      const attendanceRecord = await AttendanceModel.findOne({
        uId: attendanceID,
      });

      const punchOut = new Date(attendanceRecord.punchOut);
      const punchIn = new Date(attendanceRecord.punchIn);

      const totalHoursWorked = Number(
        ((punchOut - punchIn) / (1000 * 60 * 60)).toFixed(1)
      );

      const newData = {
        ...req.body,
        overtimeDuration: totalHoursWorked,
        overtimeDate: attendanceRecord.createdAt,
      };

      const createdData = await AttendanceOvertime.create(newData);

      if (!createdData) {
        throw customizeError(400, "Create data failed");
      }

      return res.status(200).json({
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
          status: 1,
          "attendanceDetails.location": 1,
          "attendanceDetails.department": 1,
        },
      };
      const result = await AttendanceOvertime.aggregate([
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
      ]);

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
}

const attendanceOvertime = new AttendanceOvertimeController();
export default attendanceOvertime;
