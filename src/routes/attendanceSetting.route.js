import express from "express";

import attendanceSettingController from "../controllers/attendanceSetting.controller.js";

const attendanceSettingRoutes = express.Router();

attendanceSettingRoutes.get("/", async (req, res, next) => {
  await attendanceSettingController.getAll(req, res, next);
});

attendanceSettingRoutes.post("/create", async (req, res, next) => {
  await attendanceSettingController.create(req, res, next);
});

attendanceSettingRoutes.put("/:id", async (req, res, next) => {
  await attendanceSettingController.update(req, res, next);
});

export default attendanceSettingRoutes;
