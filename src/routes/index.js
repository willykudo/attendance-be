import express from "express";

import attendanceRoutes from "./attendance.route.js";
import attendanceRequestRoutes from "./attendanceRequest.route.js";
import attendanceSettingRoutes from "./attendanceSetting.route.js";

const router = express.Router();

router.use("/api/attendance", attendanceRoutes);
router.use("/api/attendance-request", attendanceRequestRoutes);
router.use("/api/attendance-setting", attendanceSettingRoutes);

export default router;
