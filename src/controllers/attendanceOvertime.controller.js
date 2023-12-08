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

      if (!attendanceRecord) {
        return res.status(404).json({ error: "Attendance record not found" });
      }

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
      const { name, location, department } = req.query;
      const query = {};

      if (name) query.name = name;

      if (location) query.location = location;

      if (department) query.department = department;

      console.log("locations:", location);
      console.log("query:", query);

      const overtimeList = await AttendanceOvertime.find(query)
        .populate({
          path: "attendanceID",
          model: "Attendances",
          select: "location",
        })
        .exec();

      return res.status(200).json({
        data: overtimeList,
      });
    } catch (error) {
      next(error);
    }
  }
}

const attendanceOvertime = new AttendanceOvertimeController();
export default attendanceOvertime;
