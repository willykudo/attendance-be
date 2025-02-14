import { v4 } from 'uuid';

import AttendanceRequestModel from '../models/attendanceRequest.model.js';
import AttendancesModel from '../models/attendances.model.js';
import { getEmployeeinformation } from '../services/employee.js';
import { customizeError } from '../utils/common.js';

import BaseController from './base.controller.js';



class AttendanceRequestController extends BaseController {
  constructor() {
    super(AttendanceRequestModel);
  }

  async create_request(req, res, next) {
    try {
      const attendanceRecord = await AttendancesModel.findOne({
        employeeID: req.user.userLogin.uId,
      })
        .sort({ createdAt: -1 })
        .limit(1);

      if (!attendanceRecord) {
        throw customizeError(400, 'Attendance record not found');
      }

      const newData = new AttendanceRequestModel({
        ...req.body,
        employeeID: req.user.userLogin.uId,
        organizationID: req.user.userLogin.organizationID,
        uId: v4(),
        attendanceID: attendanceRecord.uId,
        scheduleID: attendanceRecord.scheduleID,
      });

      const createdData = await newData.save();
      console.log('Created attendance request:', createdData);

      if (!createdData) {
        throw customizeError(400, 'Create data failed');
      }

      return res.status(201).json({ data: createdData });
    } catch (error) {
      console.error('Error creating attendance request:', error.message);
      next(error);
    }
  }


  async get_by_id(req, res, next) {
    try {
      const attendanceRecord = await AttendanceRequestModel.findOne({
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

  async update_status(req, res, next) {
    const { id } = req.params;
    const { isHr, isManager } = req.body;

    try {
      let updateFields = {};

      if (isHr) {
        updateFields['approvalStatus.isHr.status'] = isHr.status || 'Pending';
        updateFields['approvalStatus.isHr.comment'] = isHr.comment || '';
      }

      if (isManager) {
        updateFields['approvalStatus.isManager.status'] =
          isManager.status || 'Pending';
        updateFields['approvalStatus.isManager.comment'] =
          isManager.comment || '';
      }

      const updatedAttendanceRequest =
        await AttendanceRequestModel.findOneAndUpdate(
          { uId: id },
          { $set: updateFields },
          { new: true, runValidators: true }
        );

      if (!updatedAttendanceRequest) {
        throw customizeError(404, 'Attendance request not found');
      }

      res.status(200).json({
        message: 'Approval status updated successfully',
        data: updatedAttendanceRequest,
      });
    } catch (error) {
      next(error);
    }
  }

  // async get_by_query(req, res, next) {
  //   try {
  //     const projection = {
  //       $project: {
  //         _id: 0,
  //         uId: 1,
  //         attendanceID: 1,
  //         overtimeDuration: 1,
  //         overtimeDate: 1,
  //         notes: 1,
  //         approvalStatus: 1,
  //         'attendanceDetails.location': 1,
  //         'attendanceDetails.department': 1,
  //       },
  //     };

  //     const pipeline = [
  //       {
  //         $lookup: {
  //           from: 'attendances',
  //           localField: 'attendanceID',
  //           foreignField: 'uId',
  //           as: 'attendanceDetails',
  //         },
  //       },
  //       {
  //         $match: {
  //           'attendanceDetails.location': {
  //             $regex: new RegExp(req.query.location, 'i'),
  //           },
  //           'attendanceDetails.department': {
  //             $regex: new RegExp(req.query.department, 'i'),
  //           },
  //         },
  //       },
  //       projection,
  //     ];

  //     if (req.query.skip) {
  //       pipeline.push({ $skip: parseInt(req.query.skip) });
  //     }

  //     if (req.query.limit) {
  //       pipeline.push({ $limit: parseInt(req.query.limit) });
  //     }

  //     const result = await AttendanceRequestModel.aggregate(pipeline);

  //     return res.status(200).json({
  //       data: result,
  //     });
  //   } catch (error) {
  //     next(error);
  //   }
  // }

  async get_all_request_data(req, res, next) {
    try {
      let query = {};

      const role = req.user.userLogin.role[0];
      const employeeID = req.user.userLogin.uId;

      if (role === 'admin') {
        // Admin dapat melihat semua data tanpa batasan
      } else if (role === 'supervisor') {
        // Dapatkan ID pengguna dari user saat ini
        const userID = req.user.userLogin.uId;

        // Temukan entri userInformation yang sesuai
        const userInformation = await UserInformation.findOne({ userID });

        // Pastikan entri userInformation ditemukan
        if (!userInformation) {
          return res.status(404).json({ message: 'User information not found' });
        }

        // Dapatkan supervisor ID dari entri userInformation
        const supervisorID = userInformation.reportTo;

        // Temukan semua karyawan yang memiliki supervisor dengan ID supervisor tersebut
        const employeesUnderSupervisor = await UserInformation.find({ reportTo: supervisorID }, '_id');

        // Dapatkan daftar ID karyawan dari hasil pencarian
        const employeeIDs = employeesUnderSupervisor.map(employee => employee._id);

        // Termasukkan ID supervisor sendiri
        employeeIDs.push(supervisorID);

        // Menambahkan kondisi untuk mendapatkan data kehadiran dari supervisor dan bawahannya
        query.employeeID = { $in: employeeIDs };
      } else if (role === 'employee') {
        query.employeeID = employeeID;
      } else {
        return res.status(403).json({ message: 'Access forbidden. Only supervisors, users, and admins are allowed.' });
      }

      for (const key in req.query) {
        if (
          key !== 'pages' &&
          key !== 'limit' &&
          key !== 'sortBy' &&
          key !== 'orderBy' &&
          Object.prototype.hasOwnProperty.call(req.query, key)
        ) {
          query[key] = req.query[key];
        }
      }

      const totalDoc = await AttendanceRequestModel.countDocuments();

      const pages = parseInt(req.query.pages) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (pages - 1) * limit;

      const sortBy = req.query.sortBy || 'createdAt';
      const orderBy = req.query.orderBy || 1;

      const total_Pages = Math.ceil(totalDoc / limit);

      if (pages > total_Pages) {
        throw new Error('This Page is not found!');
      }

      const data = await AttendanceRequestModel.find(query)
        .sort({ [sortBy]: orderBy })
        .limit(limit)
        .skip(skip);

      const dataQuery = await AttendanceRequestModel.find(query);

      if (data.length === 0) {
        return res.status(404).json({ message: 'Data not found' });
      }

      const totalDocs = query !== null ? dataQuery.length : totalDoc;

      const employeeInfoResult = await getEmployeeinformation();

      const dataWithEmployeeInfo = await Promise.all(
        data.map(async (attendance) => {
          try {
            const latestAttendance = await AttendancesModel.findOne({
              employeeID: attendance.employeeID,
            })
              .sort({ createdAt: -1 })
              .limit(1);

            if (latestAttendance) {
              const attendanceData = attendance.toObject();
              const matchingEmployeeInfo = employeeInfoResult.data.data.find(
                (info) => String(info.uId) === String(attendanceData.employeeID)
              );

              if (matchingEmployeeInfo) {
                attendanceData.location = latestAttendance.location;
                attendanceData.department = latestAttendance.department;
                attendanceData.employeeInfo = matchingEmployeeInfo;
              }

              return attendanceData;
            }
          } catch (error) {
            console.error(
              'Error processing employee:',
              attendance.employeeID,
              error
            );
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
      const result = AttendanceRequestModel.findOneAndDelete({ uId: id });
      if (!result) {
        throw customizeError(400, 'Delete data failed');
      }
      return res.status(200).json({ message: 'Data deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

const attendanceRequestController = new AttendanceRequestController();

export default attendanceRequestController;
