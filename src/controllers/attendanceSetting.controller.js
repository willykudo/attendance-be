import AttendanceSettingModel from "../models/attendanceSetting.model.js";
import BaseController from "./base.controller.js";

import { customizeError } from "../utils/common.js";

class AttendanceSetting extends BaseController {
  constructor() {
    super(AttendanceSettingModel);
  }

  async add_overtime_rounding(req, res, next) {
    const { id } = req.params;
    try {
      const { from, to, equal } = req.body;

      const newData = {
        from: from,
        to: to,
        equal: equal,
      };
      const result = await AttendanceSettingModel.findOneAndUpdate(
        { uId: id },
        { $push: { overtimeRounding: newData } },
        { new: true }
      );

      if (!result) {
        throw customizeError(400, "Update data failed");
      }
      return res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  async delete_overtime_rounding(req, res, next) {
    const { id, index } = req.params;
    console.log("Deleting id", overtimeRoundingID);
    try {
      const result = await AttendanceSettingModel.findOneAndDelete(
        { uId: id },
        {
          $pull: {
            overtimeRounding: { uId: overtimeRoundingID },
          },
        },
        { new: true }
      );

      if (!result) {
        throw customizeError(400, "Update data failed");
      }

      return res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }
}

const attendanceSettingController = new AttendanceSetting();
export default attendanceSettingController;
