import express from "express";

import attendanceSettingController from "../controllers/attendanceSetting.controller.js";

const attendanceSettingRoutes = express.Router();

attendanceSettingRoutes.get("/", async (req, res, next) => {
  await attendanceSettingController.get_settings(req, res, next);
});

attendanceSettingRoutes.post("/create", async (req, res, next) => {
  await attendanceSettingController.create_setting(req, res, next);
});

attendanceSettingRoutes.put("/:id", async (req, res, next) => {
  await attendanceSettingController.update_settings(req, res, next);
});

export default attendanceSettingRoutes;
