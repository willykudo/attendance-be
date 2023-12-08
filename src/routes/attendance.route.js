import express from "express";

import attendancesController from "../controllers/attendance.controller.js";

import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage }).single("image");

const attendanceRoutes = express.Router();

attendanceRoutes.post("/punch-in", upload, async (req, res, next) => {
  await attendancesController.punch_in(req, res, next);
});

// attendanceRoutes.get("/", async (req, res, next) => {
//   await attendancesController.getAll(req, res, next);
// });

attendanceRoutes.put("/punch-out/:id", upload, async (req, res, next) => {
  await attendancesController.punch_out(req, res, next);
});

attendanceRoutes.put("/break/:id", upload, async (req, res, next) => {
  await attendancesController.break(req, res, next);
});

attendanceRoutes.put("/return/:id", upload, async (req, res, next) => {
  await attendancesController.return_from_break(req, res, next);
});

attendanceRoutes.delete("/:id", async (req, res, next) => {
  await attendancesController.delete(req, res, next);
});

attendanceRoutes.get("/:id", async (req, res, next) => {
  await attendancesController.get_by_id(req, res, next);
});

attendanceRoutes.get("/", async (req, res, next) => {
  await attendancesController.get_by_query(req, res, next);
});

export default attendanceRoutes;
