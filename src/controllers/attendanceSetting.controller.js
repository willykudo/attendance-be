import { v4 } from "uuid";

import AttendanceSettingModel from "../models/attendanceSetting.model.js";
import { customizeError } from "../utils/common.js";

import BaseController from "./base.controller.js";


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

  async update_settings(req, res, next) {
    const { id } = req.params;
    const updatedData = req.body;

    try {
      const result = await AttendanceSettingModel.findOneAndUpdate(
        { uId: id },
        updatedData,
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

  async create_setting(req, res, next) {
    const newData = {
      ...req.body,
      uId: v4(),
      organizationID: req.user.userLogin.organizationID,
    };

    try {
      const createdData = await AttendanceSettingModel.create(newData);

      if (!createdData) {
        throw customizeError(400, "Create data failed");
      }
      return res.status(201).json({ data: createdData });
    } catch (error) {
      next(error);
    }
  }
}

const attendanceSettingController = new AttendanceSetting();
export default attendanceSettingController;
