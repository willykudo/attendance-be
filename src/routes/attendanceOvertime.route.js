import express from "express";

import attendanceOvertime from "../controllers/attendanceOvertime.controller.js";

const attendanceOvertimeRoutes = express.Router();

attendanceOvertimeRoutes.post("/create", async (req, res, next) => {
  await attendanceOvertime.create_overtime(req, res, next);
});

attendanceOvertimeRoutes.get("/", async (req, res, next) => {
  await attendanceOvertime.get_by_query(req, res, next);
});

attendanceOvertimeRoutes.put("/:id", async (req, res, next) => {
  await attendanceOvertime.update_status(req, res, next);
});

attendanceOvertimeRoutes.delete("/:id", async (req, res, next) => {
  await attendanceOvertime.delete(req, res, next);
});

export default attendanceOvertimeRoutes;
