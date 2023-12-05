import AttendanceRequestModel from "../models/attendanceRequest.model.js";
import BaseController from "./base.controller.js";

import { customizeError } from "../utils/common.js";

class AttendanceRequestController extends BaseController {
  constructor() {
    super(AttendanceRequestModel);
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
}

const attendanceRequestController = new AttendanceRequestController();

export default attendanceRequestController;
