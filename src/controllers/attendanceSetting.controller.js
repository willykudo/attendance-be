import AttendanceSettingModel from "../models/attendanceSetting.model.js";
import BaseController from "./base.controller.js";

import { customizeError } from "../utils/common.js";

class AttendanceSetting extends BaseController {
  constructor() {
    super(AttendanceSettingModel);
  }

  async get_settings(req, res, next) {
    try {
      const data = await this.model.find();
      if (!data) {
        throw customizeError(404, "No data found");
      }
      res.status(200).json({
        status: 200,
        message: "success",
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}

const attendanceSettingController = new AttendanceSetting();
export default attendanceSettingController;
