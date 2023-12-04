import express from "express";
import attendancesController from "../controllers/attendance.controller.js";

const attendanceRoutes = express.Router();

attendanceRoutes.get("/", async (req, res, next) => {
  await attendancesController.getAll(req, res, next);
});

attendanceRoutes.post("/punch-in", async (req, res, next) => {
  await attendancesController.punch_in(req, res, next);
});

attendanceRoutes.put("/punch-out/:id", async (req, res, next) => {
  await attendancesController.punch_out(req, res, next);
});

attendanceRoutes.put("/break/:id", async (req, res, next) => {
  await attendancesController.break(req, res, next);
});

attendanceRoutes.put("/return/:id", async (req, res, next) => {
  await attendancesController.return_from_break(req, res, next);
});

attendanceRoutes.delete("/:id", async (req, res, next) => {
  await attendancesController.delete(req, res, next);
});

export default attendanceRoutes;
