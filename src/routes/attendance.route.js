import express from 'express';

// import attendanceRequestController from '../controllers/attendanceRequest.controller.js';
import attendancesController from '../controllers/attendance.controller.js';
import { upload } from '../utils/aws.js';


const attendanceRoutes = express.Router();

// attendanceRoutes.post('/create-request', async (req, res, next) => {
//   await attendanceRequestController.create_request(req, res, next);
// });

attendanceRoutes.post(
  '/punch-in',
  upload.single('punchInImage'),
  async (req, res, next) => {
    await attendancesController.punch_in(req, res, next);
  }
);

attendanceRoutes.put(
  '/punch-out',
  upload.single('punchOutImage'),
  async (req, res, next) => {
    await attendancesController.punch_out(req, res, next);
  }
);

attendanceRoutes.put(
  '/break',
  upload.single('breakImage'),
  async (req, res, next) => {
    await attendancesController.break(req, res, next);
  }
);

attendanceRoutes.put(
  '/return-from-break',
  upload.single('returnImage'),
  async (req, res, next) => {
    await attendancesController.return_from_break(req, res, next);
  }
);

attendanceRoutes.delete('/:id', async (req, res, next) => {
  await attendancesController.delete_by_id(req, res, next);
});

attendanceRoutes.get('/:id', async (req, res, next) => {
  await attendancesController.get_by_id(req, res, next);
});

attendanceRoutes.get('/', async (req, res, next) => {
  await attendancesController.get_attendance_data(req, res, next);
});

attendanceRoutes.put('/:id', async (req, res, next) => {
  await attendancesController.update_attendance(req, res, next);
});

export default attendanceRoutes;
