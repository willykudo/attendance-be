import AttendanceOvertime from "../models/attendanceOvertime.model.js";
import AttendanceModel from "../models/attendances.model.js";
import BaseController from "./base.controller.js";

class AttendanceOvertimeController extends BaseController {
  constructor() {
    super(AttendanceOvertime);
  }

  async create_overtime(req, res, next) {
    try {
      const { attendanceID } = req.body;
      const attendanceRecord = await AttendanceModel.findOne({
        uId: attendanceID,
      });

      console.log(attendanceRecord);

      const punchOut = new Date(attendanceRecord.punchOut);
      const punchIn = new Date(attendanceRecord.punchIn);

      const totalHoursWorked = (punchOut - punchIn) / (1000 * 60 * 60);

      const newData = {
        ...req.body,
        overtimeDuration: totalHoursWorked,
        overtimeDate: attendanceRecord.createdAt,
      };

      const createdData = await AttendanceOvertime.create(newData);

      if (!createdData) {
        throw customizeError(400, "Create data failed");
      }

      return res.status(200).json({
        data: createdData,
      });
    } catch (error) {
      next(error);
    }
  }

  async get_by_query(req, res, next) {
    try {
      const projection = {
        $project: {
          _id: 0,
          uId: 1,
          attendanceID: 1,
          overtimeDuration: 1,
          overtimeDate: 1,
          notes: 1,
          status: 1,
          "attendanceDetails.location": 1,
          "attendanceDetails.department": 1,
          "attendanceDetails.name": 1,
        },
      };
      const result = await AttendanceOvertime.aggregate([
        {
          $lookup: {
            from: "attendances",
            localField: "attendanceID",
            foreignField: "uId",
            as: "attendanceDetails",
          },
        },
        {
          $match: {
            "attendanceDetails.location": {
              $regex: new RegExp(req.query.location, "i"), // Case-insensitive match
            },
            "attendanceDetails.department": {
              $regex: new RegExp(req.query.department, "i"), // Case-insensitive match
            },
            "attendanceDetails.name": {
              $regex: new RegExp(req.query.name, "i"), // Case-insensitive match
            },
          },
        },
        projection,
      ]);

      console.log(result);

      return res.status(200).json({
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

const attendanceOvertime = new AttendanceOvertimeController();
export default attendanceOvertime;
