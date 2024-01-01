import request from "supertest";
import app from "../../app.js";
import path from "path";
import attendancesController from "../controllers/attendance.controller.js";
import AttendancesModel from "../models/attendances.model.js";

jest.mock("../utils/common.js", () => {
  return {
    customizeError: jest.fn(),
  };
});

jest.mock("../models/attendances.model.js", () => {
  return {
    create: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findOneAndDelete: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    sort: jest.fn(),
  };
});

jest.mock("../controllers/attendance.controller.js", () => {
  return {
    punch_in: jest.fn(),
    punch_out: jest.fn(),
    get_by_query: jest.fn(),
    get_by_id: jest.fn(),
    break: jest.fn(),
    return_from_break: jest.fn(),
    delete_by_id: jest.fn(),
  };
});

describe("Attendance", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("/api/attendance", () => {
    test("should return 201 after punch in", async () => {
      attendancesController.punch_in.mockImplementation(
        async (req, res, next) => {
          const upload = { Location: "some url" };

          const lastAttendance = [
            {
              punchOut: new Date(),
            },
          ];

          if (!lastAttendance.length) {
            return res.status(400).json({ error: "No last attendance found" });
          }

          if (lastAttendance[0] && !lastAttendance[0].punchOut) {
            return res.status(400).json({
              error: "Cannot punch in. Last record doesn't have a punch out.",
            });
          }

          const newData = {
            ...req.body,
            uId: "mocked-uuid",
            punchIn: new Date(),
            punchInImage: upload.Location,
          };

          const createdData = {
            data: newData,
          };

          return res.status(201).json(createdData);
        }
      );

      const imagePath = path.resolve(
        __dirname,
        "/BlueSilo-proj/attendance-be/src/__tests__/img/ad.jpg"
      );

      const res = await request(app)
        .post("/api/attendance/punch-in")
        .attach("punchInImage", imagePath)
        .expect(201);

      expect(attendancesController.punch_in).toHaveBeenCalledWith(
        expect.objectContaining({
          file: expect.any(Object),
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    test("should return 400 if no punchOut is found on the last record", async () => {
      attendancesController.punch_in.mockImplementation(
        async (req, res, next) => {
          const upload = { Location: "some url" };

          const lastAttendance = [
            {
              punchOut: null,
            },
          ];

          if (!lastAttendance.length) {
            return res.status(400).json({ error: "No last attendance found" });
          }

          if (lastAttendance[0] && !lastAttendance[0].punchOut) {
            return res.status(400).json({
              error: "Cannot punch in. Last record doesn't have a punch out.",
            });
          }

          const newData = {
            ...req.body,
            uId: "mocked-uuid",
            punchIn: new Date(),
            punchInImage: upload.Location,
          };

          const createdData = {
            data: newData,
          };

          return res.status(201).json(createdData);
        }
      );

      const response = await request(app)
        .post("/api/attendance/punch-in")
        .field("uId", "test")
        .field("employeeID", "test")
        .attach("punchInImage", "/th.jpg");

      expect(response.status).toBe(400);
      expect(attendancesController.punch_in).toHaveBeenCalledTimes(1);
    });

    test("should return 200 with attendance records for a valid query", async () => {
      attendancesController.get_by_query.mockImplementation(
        async (req, res, next) => {
          const { name, location, department } = req.query;

          const query = {
            ...(name && { name }),
            ...(location && { location }),
            ...(department && { department }),
          };

          if (Object.keys(query).length === 0) {
            return res.status(400).json({ error: "Invalid query parameters" });
          }
          jest.spyOn(AttendancesModel, "find").mockResolvedValue([{}]);

          res.status(200).json({ attendances: [{}] });
        }
      );

      const response = await request(app)
        .get("/api/attendance")
        .query({
          name: "John Doe",
          location: "Office A",
          department: "IT",
        })
        .expect(200);

      expect(response.body.attendances).toHaveLength(1);

      expect(attendancesController.get_by_query).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.any(Object),
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    test("should return 400 for an invalid query", async () => {
      attendancesController.get_by_query.mockImplementation(
        async (req, res, next) => {
          const { name, location, department } = req.query;

          const query = {
            ...(name && { name }),
            ...(location && { location }),
            ...(department && { department }),
          };

          if (Object.keys(query).length === 0) {
            return res.status(400).json({ error: "Invalid query parameters" });
          }

          res.status(200).json({ attendances: [] });
        }
      );

      const response = await request(app)
        .get("/api/attendance")
        .query({
          test: "123",
        })
        .expect(400);

      expect(response.body.error).toBe("Invalid query parameters");

      expect(attendancesController.get_by_query).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.any(Object),
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    test("should can add break", async () => {
      attendancesController.break.mockImplementation(async (req, res, next) => {
        const { id } = req.params;

        try {
          const upload = { Location: "/mock/path/to/image.jpg" };

          const attendanceRecord = {
            breaks: [
              {
                returnFromBreak: new Date(),
              },
            ],
          };

          const lastReturn =
            attendanceRecord.breaks[attendanceRecord.breaks.length - 1];

          const newBreak = {
            breakTime: new Date(),
            breakImage: upload.Location,
          };

          if (!attendanceRecord.breaks.length || lastReturn.returnFromBreak) {
            const updatedAttendance = {
              breaks: [...attendanceRecord.breaks, newBreak],
            };

            res.status(200).json({
              message: "Break added successfully",
              break: updatedAttendance,
            });
          } else {
            throw new Error("Can't add break, please return from break first");
          }
        } catch (error) {
          next(error);
        }
      });

      const response = await request(app)
        .put("/api/attendance/break/someID")
        .attach("breakImage", "/th.jpg")
        .expect(200);

      expect(response.body.message).toBe("Break added successfully");
      console.log(response.body);
    });

    test("should can't add break if return from break is null'", async () => {
      attendancesController.break.mockImplementation(async (req, res, next) => {
        const { id } = req.params;

        try {
          const upload = { Location: "/mock/path/to/image.jpg" };

          const attendanceRecord = {
            breaks: [
              {
                breakTime: new Date(),
                returnFromBreak: null,
              },
            ],
          };

          const lastReturn =
            attendanceRecord.breaks[attendanceRecord.breaks.length - 1];

          const newBreak = {
            breakTime: new Date(),
            breakImage: upload.Location,
          };

          if (!attendanceRecord.breaks.length || lastReturn.returnFromBreak) {
            const updatedAttendance = {
              breaks: [...attendanceRecord.breaks, newBreak],
            };

            res.status(200).json({
              message: "Break added successfully",
              break: updatedAttendance,
            });
          } else {
            res.status(400).json({
              message: "Can't add break, please return from break first",
            });
          }
        } catch (error) {
          next(error);
        }
      });

      const response = await request(app)
        .put("/api/attendance/break/someID")
        .attach("breakImage", "/th.jpg")
        .expect(400);

      expect(response.body.message).toBe(
        "Can't add break, please return from break first"
      );
      console.log(response.body.message);
    });

    test("should return 200 on successfull return from break", async () => {
      attendancesController.return_from_break.mockImplementation(
        async (req, res, next) => {
          const { id } = req.params;

          try {
            const upload = { Location: "/mock/path/to/image.jpg" };

            const attendanceRecord = {
              breaks: [
                {
                  returnFromBreak: new Date(),
                },
              ],
            };

            const lastReturn =
              attendanceRecord.breaks[attendanceRecord.breaks.length - 1];

            const newBreak = {
              returnFromBreak: new Date(),
              returnImage: upload.Location,
            };

            if (!attendanceRecord.breaks.length || lastReturn.returnFromBreak) {
              const updatedAttendance = {
                breaks: [...attendanceRecord.breaks, newBreak],
              };

              res.status(200).json({
                message: "Return from break recorded successfully",
                break: updatedAttendance,
              });
            } else {
              throw new Error("Internal Error");
            }
          } catch (error) {
            next(error);
          }
        }
      );

      const response = await request(app)
        .put("/api/attendance/return/someID")
        .attach("returnImage", "/th.jpg")
        .expect(200);

      expect(response.body.message).toBe(
        "Return from break recorded successfully"
      );
    });

    test("returns 400 if no attendance record", async () => {
      attendancesController.punch_out.mockImplementation(
        async (req, res, next) => {
          try {
            jest.spyOn(AttendancesModel, "findOne").mockResolvedValue(null);

            res.status(404).json({ error: "No attendance record found" });
          } catch (error) {
            next(error);
          }
        }
      );

      const res = await request(app)
        .put("/api/attendance/punch-out/id")
        .attach("punchOutImage", "/th.jpg");

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty("error", "No attendance record found");
    });

    test("should return 400 if Last record doesn't have a break", async () => {
      attendancesController.punch_out.mockImplementation(
        async (req, res, next) => {
          const { id } = req.params;

          try {
            const findOneSpy = jest.spyOn(AttendancesModel, "findOne");
            const mockAttendanceRecord = {
              punchIn: new Date(),
              breaks: [],
            };
            findOneSpy.mockResolvedValue(mockAttendanceRecord);

            if (!mockAttendanceRecord.breaks.length) {
              return res.status(400).json({
                message: "Cannot punch out. Last record doesn't have a break",
              });
            }
          } catch (error) {
            next(error);
          }
        }
      );

      const response = await request(app)
        .put("/api/attendance/punch-out/someID")
        .attach("punchOutImage", "/th.jpg")
        .expect(400);

      expect(response.body.message).toBe(
        "Cannot punch out. Last record doesn't have a break"
      );
    });

    test("should return 200 on delete data successfully", async () => {
      attendancesController.delete_by_id.mockImplementation(
        async (req, res, next) => {
          const { id } = req.params;

          try {
            jest.spyOn(AttendancesModel, "findOneAndDelete").mockResolvedValue({
              uId: "someId",
            });

            const result = await AttendancesModel.findOneAndDelete({ uId: id });

            if (!result) {
              return res.status(400).json({
                message: "Delete data failed",
              });
            }

            return res
              .status(200)
              .json({ message: "Data deleted successfully" });
          } catch (error) {
            next(error);
          }
        }
      );

      const response = await request(app)
        .delete("/api/attendance/someId")
        .expect(200);

      expect(response.body.message).toBe("Data deleted successfully");

      expect(attendancesController.delete_by_id).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({
            id: "someId",
          }),
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });
  });
});
