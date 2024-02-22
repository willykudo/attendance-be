import express from 'express';

import attendanceRoutes from './attendance.route.js';
import attendanceRequestRoutes from './attendanceRequest.route.js';
import attendanceSettingRoutes from './attendanceSetting.route.js';
import attendanceOvertimeRoutes from './attendanceOvertime.route.js';
import { isAuthorized } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use('/api/attendance', isAuthorized, attendanceRoutes);
router.use('/api/attendance-request', isAuthorized, attendanceRequestRoutes);
router.use('/api/attendance-setting', isAuthorized, attendanceSettingRoutes);
router.use('/api/attendance-overtime', isAuthorized, attendanceOvertimeRoutes);

export default router;
