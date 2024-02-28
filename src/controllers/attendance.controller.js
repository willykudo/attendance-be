import AttendancesModel from '../models/attendances.model.js';
import BaseController from './base.controller.js';
import { customizeError } from '../utils/common.js';
import { getEmployeeinformation } from '../services/employee.js';

import { uploadFile } from '../utils/aws.js';

import { v4 } from 'uuid';

class AttendancesController extends BaseController {
  constructor() {
    super(AttendancesModel);
  }

  async punch_in(req, res, next) {
    try {
      const upload = await uploadFile(req.file);

      const employeeID = req.user.userLogin.uId;
      const organizationID = req.user.userLogin.organizationID;

      const lastAttendance = await AttendancesModel.find({
        employeeID: employeeID,
      }).sort({ punchIn: -1 });

      if (lastAttendance.length === 0 || lastAttendance[0].punchOut) {
        const newData = {
          ...req.body,
          employeeID: employeeID,
          organizationID: organizationID,
          uId: v4(),
          punchIn: new Date(),
          punchInImage: upload.Location,
        };

        const createdData = await AttendancesModel.create(newData);

        return res.status(201).json({ data: createdData });
      } else if (!lastAttendance[0].punchOut) {
        throw customizeError(
          400,
          "Cannot punch in. Last record doesn't have a punch out."
        );
      }
    } catch (error) {
      next(error);
    }
  }

  async punch_out(req, res, next) {
    const employeeID = req.user.userLogin.uId;

    try {
      const attendanceRecords = await AttendancesModel.find({
        employeeID: employeeID,
      }).sort({ punchIn: -1 });

      if (!attendanceRecords || attendanceRecords.length === 0) {
        throw customizeError(400, 'Attendance record not found');
      }

      const lastAttendanceRecord = attendanceRecords[0];

      const checkLastBreak =
        lastAttendanceRecord &&
        lastAttendanceRecord.breaks[lastAttendanceRecord.breaks.length - 1];

      console.log('checkLastBreak: ', checkLastBreak);

      if (!checkLastBreak) {
        throw customizeError(
          400,
          "Cannot punch out. Last record doesn't have a break"
        );
      }

      if (!checkLastBreak.returnFromBreak) {
        throw customizeError(
          400,
          "Cannot punch out. Last record doesn't have a return from break"
        );
      }

      const punchInTime = lastAttendanceRecord.punchIn;
      const punchOutTime = new Date();
      const totalHoursWorked = (punchOutTime - punchInTime) / (1000 * 60 * 60);

      const status = totalHoursWorked > 8 ? 'On Time' : 'Late';

      const upload = await uploadFile(req.file);

      lastAttendanceRecord.punchOutDesc = req.body.punchOutDesc;
      lastAttendanceRecord.punchOutGps = req.body.punchOutGps;
      lastAttendanceRecord.punchOut = punchOutTime;
      lastAttendanceRecord.status = status;
      lastAttendanceRecord.punchOutImage = upload.Location;

      await lastAttendanceRecord.save();

      return res.status(200).json({ data: lastAttendanceRecord });
    } catch (error) {
      next(error);
    }
  }

  async break(req, res, next) {
    const employeeID = req.user.userLogin.uId;

    try {
      const upload = await uploadFile(req.file);

      const latestAttendanceRecord = await AttendancesModel.findOne({
        employeeID: employeeID,
      }).sort({ punchIn: -1 });

      if (!latestAttendanceRecord) {
        throw customizeError(400, 'Attendance record not found');
      }

      const lastRecord =
        latestAttendanceRecord.breaks[latestAttendanceRecord.breaks.length - 1];

      const newBreak = {
        ...req.body,
        breakTime: new Date(),
        breakImage: upload.Location,
      };

      if (
        !latestAttendanceRecord.breaks.length ||
        (lastRecord && lastRecord.returnFromBreak)
      ) {
        // If there are no breaks or the last break is returned, add a new break
        latestAttendanceRecord.breaks.push(newBreak);

        // Save the entire document, not just the breaks array
        await latestAttendanceRecord.save();

        res
          .status(200)
          .json({ message: 'Break added successfully', break: newBreak });
      } else {
        // If the last break is not returned, throw an error
        throw customizeError(
          400,
          "Can't add break, please return from break first"
        );
      }
    } catch (error) {
      next(error);
    }
  }

  async return_from_break(req, res, next) {
    const employeeID = req.user.userLogin.uId;

    try {
      const attendanceRecord = await AttendancesModel.find({
        employeeID: employeeID,
      })
        .sort({ punchIn: -1 })
        .limit(1)
        .exec();

      if (!attendanceRecord || attendanceRecord.length === 0) {
        throw customizeError(400, 'Attendance record not found');
      }

      const latestRecord = attendanceRecord[0];

      const lastReturn = latestRecord.breaks[latestRecord.breaks.length - 1];

      if (!lastReturn) {
        throw customizeError(400, 'No breaks found, cannot return from break');
      }

      if (lastReturn.returnFromBreak) {
        throw customizeError(400, 'Return from break already recorded');
      }

      lastReturn.returnFromBreak = new Date();
      lastReturn.returnDesc = req.body.returnDesc;

      const upload = await uploadFile(req.file);
      lastReturn.returnImage = upload.Location;

      // Save the entire document, not just the breaks array
      await latestRecord.save();

      res.status(200).json({
        message: 'Return from break recorded successfully',
        return: lastReturn,
      });
    } catch (error) {
      next(error);
    }
  }

  async get_by_id(req, res, next) {
    employeeID = req.user.userLogin.uId;

    try {
      const attendanceRecord = await AttendancesModel.findOne({
        employeeID: employeeID,
      });

      if (!attendanceRecord) {
        throw customizeError(400, 'Attendance record not found');
      }

      res.status(200).json({ data: attendanceRecord });
    } catch (error) {
      next(error);
    }
  }

  async get_attendance_data(req, res, next) {
    try {
      // QUERY BASE ON MODEL DATA
      let query = {};

      const role = req.user.userLogin.role;
      const employeeID = req.user.userLogin.uId;

      if (role === 'user') {
        query.employeeID = employeeID;
      }

      for (const key in req.query) {
        if (
          key !== 'pages' &&
          key !== 'limit' &&
          key !== 'sortBy' &&
          key !== 'orderBy' &&
          Object.prototype.hasOwnProperty.call(req.query, key)
        ) {
          // Check if the field exists in the model
          const fieldExists = Object.keys(
            AttendancesModel.schema.paths
          ).includes(key);
          if (fieldExists) {
            query[key] = req.query[key]; // Add to search criteria
          } else {
            return res.status(500).json({
              msg: `Field '${key}' Not Found`,
            });
          }
        }
      }

      const totalDoc = await AttendancesModel.countDocuments();

      // PAGINATION
      const pages = parseInt(req.query.pages) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (pages - 1) * limit;
      // SORTING BY ASCENDING OR DESCENDING
      const sortBy = req.query.sortBy || 'createdAt';
      const orderBy = req.query.orderBy || 1;

      const total_Pages = Math.ceil(totalDoc / limit);

      if (pages > total_Pages) {
        throw new Error('This Page is not found!');
      }

      const data = await AttendancesModel.find(query)
        .sort({ [sortBy]: orderBy })
        .limit(limit)
        .skip(skip);

      const dataQuery = await AttendancesModel.find(query);

      if (data.length === 0) {
        return res.status(404).json({ message: 'Data not found' });
      }

      const totalDocs = query !== null ? dataQuery.length : totalDoc;

      const dataWithEmployeeInfo = await Promise.all(
        data.map(async (attendance) => {
          const employeeInfoResult = await getEmployeeinformation(
            attendance.employeeID
          );
          if (employeeInfoResult.success) {
            const attendanceData = attendance.toObject();
            attendanceData.employeeInfo = employeeInfoResult.data;
            return attendanceData;
          }
        })
      );

      return res.status(200).json({
        pages: pages,
        limit: limit,
        totalDoc: totalDocs,
        data: dataWithEmployeeInfo,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete_by_id(req, res, next) {
    const { id } = req.params;
    try {
      const result = await AttendancesModel.findOneAndDelete({ uId: id });
      if (!result) {
        throw customizeError(400, 'Delete data failed');
      }
      return res.status(200).json({ message: 'Data deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

const attendancesController = new AttendancesController();
export default attendancesController;
