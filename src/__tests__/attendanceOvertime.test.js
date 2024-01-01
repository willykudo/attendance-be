import request from "supertest";
import app from "../../app.js";
import attendanceOvertime from "../controllers/attendanceOvertime.controller.js";
import AttendanceOvertime from "../models/attendanceOvertime.model.js";

jest.mock("../controllers/attendanceOvertime.controller.js", () => {
  return {
    create_overtime: jest.fn(),
    get_by_id: jest.fn(),
    update_status: jest.fn(),
    get_by_query: jest.fn(),
    delete: jest.fn(),
    delete_by_id: jest.fn(),
  };
});

jest.mock("../utils/common.js", () => {
  return {
    customizeError: jest.fn(),
  };
});

jest.mock("../models/attendanceOvertime.model.js", () => {
  return {
    find: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    aggregate: jest.fn(),
    findOneAndDelete: jest.fn(),
    next: jest.fn(),
  };
});

describe("Attendance Overtime", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe("/api/attendance-overtime", () => {
    test("should return 200 when create_overtime is successful", async () => {
      attendanceOvertime.create_overtime.mockImplementation(
        async (req, res, next) => {
          try {
            const createSpy = jest.spyOn(AttendanceOvertime, "create");
            const mockCreatedData = {
              ...req.body,
              uId: "mocked-overtime-id",
              overtimeDuration: 5.5,
              overtimeDate: "string",
            };
            createSpy.mockResolvedValue(mockCreatedData);

            return res.status(201).json({ data: mockCreatedData });
          } catch (error) {
            next(error);
          }
        }
      );

      const response = await request(app)
        .post("/api/attendance-overtime/create")
        .send({
          attendanceID: "mocked-attendance-id",
          employeeID: "mocked-employee-id",
        })
        .expect(201);

      console.log(response.body.data);

      expect(response.body.data).toEqual(
        expect.objectContaining({
          uId: "mocked-overtime-id",
          overtimeDuration: expect.any(Number),
          overtimeDate: expect.any(String),
        })
      );

      expect(attendanceOvertime.create_overtime).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            attendanceID: "mocked-attendance-id",
            employeeID: "mocked-employee-id",
          }),
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    test("should return 400 when failure creating record", async () => {
      attendanceOvertime.create_overtime.mockImplementation(
        async (req, res) => {
          const mockData = {
            ...req.body,
            uId: "mocked-overtime-id",
            overtimeDate: "string",
          };

          if (!mockData.overtimeDuration) {
            return res.status(400).json({ message: "Creating data failed" });
          }

          return res.status(201).json({ data: mockData });
        }
      );

      const response = await request(app)
        .post("/api/attendance-overtime/create")
        .send({
          attendanceID: "mocked-attendance-id",
          employeeID: "mocked-employee-id",
        })
        .expect(400);

      expect(response.body).toHaveProperty("message", "Creating data failed");
    });

    test("should return 200 when update_status is successful", async () => {
      attendanceOvertime.update_status.mockImplementation(
        async (req, res, next) => {
          try {
            const findOneAndUpdateSpy = jest.spyOn(
              AttendanceOvertime,
              "findOneAndUpdate"
            );
            const mockUpdatedReq = {
              approvalStatus: {
                isHr: {
                  status: req.body.isHr.status,
                  comment: req.body.isHr.comment,
                },
                isManager: {
                  status: req.body.isManager.status,
                  comment: req.body.isManager.comment,
                },
              },
            };

            findOneAndUpdateSpy.mockResolvedValueOnce(mockUpdatedReq);

            res.status(200).json({
              message: "Approval status updated successfully",
              data: mockUpdatedReq,
            });
          } catch (error) {
            next(error);
          }
        }
      );

      const response = await request(app)
        .put("/api/attendance-overtime/658b05786f3b84051e3008bd")
        .send({
          isHr: {
            status: "Approved",
            comment: "Hr approval comment",
          },
          isManager: {
            status: "Approved",
            comment: "Manager approval comment",
          },
        })
        .expect(200);

      expect(response.body.message).toBe(
        "Approval status updated successfully"
      );

      expect(response.body.data).toEqual(
        expect.objectContaining({
          approvalStatus: {
            isHr: {
              status: "Approved",
              comment: "Hr approval comment",
            },
            isManager: {
              status: "Approved",
              comment: "Manager approval comment",
            },
          },
        })
      );
    });

    test("should return 404 when no record is found when updating status", async () => {
      attendanceOvertime.update_status.mockImplementation(async (req, res) => {
        try {
          const findOneAndUpdateSpy = jest.spyOn(
            AttendanceOvertime,
            "findOneAndUpdate"
          );

          findOneAndUpdateSpy.mockRejectedValueOnce(
            new Error("Record not found")
          );

          res.status(200).json({
            message: "Approval status updated successfully",
            data: mockUpdatedReq,
          });
        } catch (error) {
          res.status(404).json({ error: "Attendance request not found" });
        }
      });

      const response = await request(app)
        .put("/api/attendance-overtime/658b05786f3b84051e3008bd")
        .send({
          isHr: {
            status: "Approved",
            comment: "Hr approval comment",
          },
          isManager: {
            status: "Approved",
            comment: "Manager approval comment",
          },
        })
        .expect(404);

      expect(response.body.error).toBe("Attendance request not found");
    });

    test("should return 200 with attendance records for a valid query", async () => {
      attendanceOvertime.get_by_query.mockImplementation(
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
          jest.spyOn(AttendanceOvertime, "find").mockResolvedValue([{}]);

          res.status(200).json({ attendances: [{}] });
        }
      );

      const response = await request(app)
        .get("/api/attendance-overtime")
        .query({
          name: "John Doe",
          location: "Office A",
          department: "IT",
        })
        .expect(200);

      expect(response.body.attendances).toHaveLength(1);

      expect(attendanceOvertime.get_by_query).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.any(Object),
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    test("should return 400 for an invalid query", async () => {
      attendanceOvertime.get_by_query.mockImplementation(
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
        .get("/api/attendance-overtime")
        .query({
          test: "123",
        })
        .expect(400);

      expect(response.body.error).toBe("Invalid query parameters");

      expect(attendanceOvertime.get_by_query).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.any(Object),
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    test("should return 200 when get_by_id is successful", async () => {
      attendanceOvertime.get_by_id.mockImplementation(
        async (req, res, next) => {
          const { id } = req.params;

          const mockedRecord = {
            uId: id,
          };

          if (id === mockedRecord.uId) {
            res.status(200).json({ data: mockedRecord });
          } else {
            throw customizeError(400, "Attendance record not found");
          }
        }
      );

      // Make a request to your endpoint
      const response = await request(app).get(
        "/api/attendance-overtime/some-id"
      );

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(
        expect.objectContaining({
          uId: "some-id",
        })
      );

      expect(attendanceOvertime.get_by_id).toHaveBeenCalledTimes(1);
    });

    test("should return 404 if no attendance record", async () => {
      attendanceOvertime.get_by_id.mockImplementation(
        async (req, res, next) => {
          try {
            const { id } = req.params;

            const mockedRecord = {
              uId: "aw",
            };

            if (id === mockedRecord.uId) {
              res.status(200).json({ data: mockedRecord });
            } else {
              throw new Error("Attendance record not found");
            }
          } catch (error) {
            res
              .status(404)
              .json({ error: error.message || "Attendance record not found" });
          }
        }
      );

      const response = await request(app).get(
        "/api/attendance-overtime/some-id"
      );

      expect(response.status).toBe(404);
      expect(response.body.error).toEqual("Attendance record not found");

      expect(attendanceOvertime.get_by_id).toHaveBeenCalledTimes(1);
    });

    test("should return 200 after deleting an attendance record", async () => {
      attendanceOvertime.delete_by_id.mockImplementation(
        async (req, res, next) => {
          const { id } = req.params;

          if (!id) {
            return res.status(400).json({ error: "Invalid request" });
          }

          try {
            const findOneAndDeleteSpy = jest.spyOn(
              AttendanceOvertime,
              "findOneAndDelete"
            );
            findOneAndDeleteSpy.mockResolvedValue({
              uId: id,
              name: "John Doe",
              location: "Office A",
              department: "IT",
            });

            const result = await AttendanceOvertime.findOneAndDelete({
              uId: id,
            });

            if (result) {
              res
                .status(200)
                .json({ message: "Attendance record deleted successfully" });
            }
          } catch (error) {
            res.status(404).json({ error: "Attendance record not found" });
          }
        }
      );

      const response = await request(app)
        .delete("/api/attendance-overtime/658b05786f3b84051e3008bd")
        .expect(200);
    });
  });
});
