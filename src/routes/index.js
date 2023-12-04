import express from "express";

import attendanceRoutes from "./attendance.route.js";

const router = express.Router();

router.use("/api/attendance", attendanceRoutes);

export default router;
