import express from "express";

import attendanceRequestController from "../controllers/attendanceRequest.controller.js";

const attendanceRequestRoutes = express.Router();

attendanceRequestRoutes.post("/create", async (req, res, next) => {
  await attendanceRequestController.create(req, res, next);
});

attendanceRequestRoutes.delete("/:id", async (req, res, next) => {
  await attendanceRequestController.delete(req, res, next);
});

attendanceRequestRoutes.put("/:id", async (req, res, next) => {
  await attendanceRequestController.update(req, res, next);
});

attendanceRequestRoutes.get("/all", async (req, res, next) => {
  await attendanceRequestController.getAll(req, res, next);
});

attendanceRequestRoutes.get("/:id", async (req, res, next) => {
  await attendanceRequestController.get_by_id(req, res, next);
});

export default attendanceRequestRoutes;
