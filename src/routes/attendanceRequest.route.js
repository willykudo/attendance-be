import express from 'express';

import attendanceRequestController from '../controllers/attendanceRequest.controller.js';

const attendanceRequestRoutes = express.Router();

attendanceRequestRoutes.post('/create', async (req, res, next) => {
  await attendanceRequestController.create_request(req, res, next);
});

attendanceRequestRoutes.delete('/:id', async (req, res, next) => {
  await attendanceRequestController.delete_by_id(req, res, next);
});

attendanceRequestRoutes.put('/:id', async (req, res, next) => {
  await attendanceRequestController.update_status(req, res, next);
});

attendanceRequestRoutes.get('/', async (req, res, next) => {
  await attendanceRequestController.get_all_request_data(req, res, next);
});

attendanceRequestRoutes.get('/:id', async (req, res, next) => {
  await attendanceRequestController.get_by_id(req, res, next);
});

export default attendanceRequestRoutes;
