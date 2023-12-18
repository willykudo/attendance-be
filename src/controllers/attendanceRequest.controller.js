import AttendanceRequestModel from "../models/attendanceRequest.model.js";
import AttendancesModel from "../models/attendances.model.js";
import BaseController from "./base.controller.js";

import { customizeError } from "../utils/common.js";

import { v4 } from "uuid";

class AttendanceRequestController extends BaseController {
  constructor() {
    super(AttendanceRequestModel);
  }

  async create_request(req, res, next) {
    try {
      const attendanceRecord = await AttendancesModel.findOne({
        employeeID: req.body.employeeID,
      })
        .sort({ createdAt: -1 })
        .limit(1);

      if (!attendanceRecord) {
        throw customizeError(400, "Attendance record not found");
      }

      const newData = new AttendanceRequestModel({
        ...req.body,
        uId: v4(),
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

      const result = await AttendanceRequestModel.aggregate(pipeline);

      return res.status(200).json({
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

const attendanceRequestController = new AttendanceRequestController();

export default attendanceRequestController;
