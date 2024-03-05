import AttendancesModel from '../models/attendances.model.js';
import BaseController from './base.controller.js';
import { customizeError } from '../utils/common.js';
import { getEmployeeinformation } from '../services/employee.js';
import { parse, format, startOfDay, endOfDay } from 'date-fns';

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

  // async get_attendance_data(req, res, next) {
  //   try {
  //     let query = {};

  //     const role = req.user.userLogin.role;
  //     const employeeID = req.user.userLogin.uId;

  //     if (role === 'user') {
  //       query.employeeID = employeeID;
  //     }

  //     for (const key in req.query) {
  //       if (
  //         key !== 'pages' &&
  //         key !== 'limit' &&
  //         key !== 'sortBy' &&
  //         key !== 'orderBy' &&
  //         Object.prototype.hasOwnProperty.call(req.query, key)
  //       ) {
  //         const fieldExists = Object.keys(
  //           AttendancesModel.schema.paths
  //         ).includes(key);
  //         if (fieldExists) {
  //           if (fieldExists) {
  //             console.log(`Processing field: ${key}`);
  //             if (key === 'punchIn' || key === 'punchOut') {
  //               const parsedDate = parse(
  //                 req.query[key],
  //                 'dd/MM/yyyy',
  //                 new Date()
  //               );
  //               query[key] = {
  //                 $gte: new Date(
  //                   parsedDate.toISOString().split('T')[0] + 'T00:00:00.000Z'
  //                 ).toISOString(),
  //                 $lt: new Date(
  //                   parsedDate.getTime() + 24 * 60 * 60 * 1000 - 1
  //                 ).toISOString(),
  //               };
  //               console.log(
  //                 `Converted ${key} to ISO: ${query[key].$gte} - ${query[key].$lt}`
  //               );
  //             } else {
  //               query[key] = req.query[key];
  //               console.log(
  //                 `Field ${key} added to search criteria: ${query[key]}`
  //               );
  //             }
  //           } else {
  //             query[key] = req.query[key];
  //           }
  //         } else {
  //           return res.status(500).json({
  //             msg: `Field '${key}' Not Found`,
  //           });
  //         }
  //       }
  //     }

  //     const totalDoc = await AttendancesModel.countDocuments(query);

  //     // PAGINATION
  //     const pages = parseInt(req.query.pages) || 1;
  //     const limit = parseInt(req.query.limit) || 10;
  //     const skip = (pages - 1) * limit;
  //     // SORTING BY ASCENDING OR DESCENDING
  //     const sortBy = req.query.sortBy || 'createdAt';
  //     const orderBy = req.query.orderBy || 1;

  //     const total_Pages = Math.ceil(totalDoc / limit);

  //     if (pages > total_Pages) {
  //       throw new Error('This Page is not found!');
  //     }

  //     const data = await AttendancesModel.find(query)
  //       .sort({ [sortBy]: orderBy })
  //       .limit(limit)
  //       .skip(skip);

  //     const dataQuery = await AttendancesModel.find(query);

  //     if (data.length === 0) {
  //       return res.status(404).json({ message: 'Data not found' });
  //     }

  //     const totalDocs = query !== null ? dataQuery.length : totalDoc;

  //     const employeeInfoResult = await getEmployeeinformation();

  //     const dataWithEmployeeInfo = data.map((attendance) => {
  //       const attendanceData = attendance.toObject();

  //       // Find the matching employeeInfo by comparing employeeID
  //       const matchingEmployeeInfo = employeeInfoResult.data.data.find(
  //         (info) => {
  //           return String(info.uId) === String(attendanceData.employeeID);
  //         }
  //       );

  //       attendanceData.employeeInfo = matchingEmployeeInfo || null;

  //       return attendanceData;
  //     });

  //     return res.status(200).json({
  //       pages: pages,
  //       limit: limit,
  //       totalDoc: totalDocs,
  //       data: dataWithEmployeeInfo,
  //     });
  //   } catch (error) {
  //     next(error);
  //   }
  // }

  async get_attendance_data(req, res, next) {
    try {
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
          const fieldExists = Object.keys(
            AttendancesModel.schema.paths
          ).includes(key);
          if (fieldExists) {
            console.log(`Processing field: ${key}`);

            if (key === 'punchIn' || key === 'punchOut') {
              const parsedDate = parse(
                req.query[key],
                'dd/MM/yyyy',
                new Date()
              );
              if (!parsedDate || isNaN(parsedDate.getTime())) {
                console.log(
                  `Invalid date format for ${key}: ${req.query[key]}`
                );
                return res.status(400).json({
                  msg: `Invalid date format for ${key}: ${req.query[key]}`,
                });
              }

              query[key] = {
                $gte: startOfDay(parsedDate),
                $lt: endOfDay(parsedDate),
              };
              console.log(
                `Converted ${key} to ISO: ${query[key].$gte} - ${query[key].$lt}`
              );
            } else {
              query[key] = req.query[key];
              console.log(
                `Field ${key} added to search criteria: ${query[key]}`
              );
            }
          } else {
            return res.status(500).json({
              msg: `Field '${key}' Not Found`,
            });
          }
        }
      }

      const totalDoc = await AttendancesModel.countDocuments(query);

      // PAGINATION
      const pages = parseInt(req.query.pages) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (pages - 1) * limit;
      // SORTING BY ASCENDING OR DESCENDING
      const sortBy = req.query.sortBy || 'createdAt';
      const orderBy = req.query.orderBy || 1;

      const total_Pages = Math.ceil(totalDoc / limit);

      if (pages > total_Pages) {
        // If the requested page is greater than total pages, default to the last page
        return res.status(404).json({ message: 'This Page is not found!' });
      }

      const data = await AttendancesModel.find(query)
        .sort({ [sortBy]: orderBy })
        .limit(limit)
        .skip(skip);

      const dataQuery = await AttendancesModel.find(query);

      if (data.length === 0) {
        return res.status(404).json({ message: 'Data not found' });
      }

      const employeeInfoResult = await getEmployeeinformation();

      const dataWithEmployeeInfo = data.map((attendance) => {
        const attendanceData = attendance.toObject();
        const matchingEmployeeInfo = employeeInfoResult.data.data.find(
          (info) => {
            return String(info.uId) === String(attendanceData.employeeID);
          }
        );
        attendanceData.employeeInfo = matchingEmployeeInfo || null;

        return attendanceData;
      });

      return res.status(200).json({
        pages,
        limit,
        totalDoc: query !== null ? dataQuery.length : totalDoc,
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
