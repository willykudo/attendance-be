import request from "supertest";
import app from "../../app.js";
import AttendanceRequestModel from "../models/attendanceRequest.model.js";
import attendanceRequestController from "../controllers/attendanceRequest.controller.js";
import AttendancesModel from "../models/attendances.model.js";

jest.mock("../models/attendances.model.js", () => {
  return {
    create: jest.fn(),
    findOneAndUpdate: jest.fn(),
    find: jest.fn(),
    findOneAndDelete: jest.fn(),
    findOne: jest.fn(),
  };
});

jest.mock("../models/attendanceRequest.model.js", () => {
  return {
    create: jest.fn(),
    findOneAndUpdate: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneAndDelete: jest.fn(),
  };
});

jest.mock("../controllers/attendanceRequest.controller.js", () => {
  return {
    create_request: jest.fn(),
    get_by_id: jest.fn(),
    update_status: jest.fn(),
    get_by_query: jest.fn(),
    delete_by_id: jest.fn(),
  };
});

describe("Attendance Request", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe("api/attendance-request/", () => {
    test("should return 201 when create_request is successful", async () => {
      attendanceRequestController.create_request.mockImplementation(
        async (req, res) => {
          const attendanceRecord = {
            data: {
              employeeID: "test",
              punchIn: new Date(),
              punchOut: new Date(),
            },
          };

          const newData = {
            ...attendanceRecord.data,
            ...req.body,
            uId: "test",
          };

          res.status(201).json({ data: newData });
        }
      );

      const response = await request(app).post(
        "/api/attendance-request/create"
      );

      expect(response.status).toBe(201);
      expect(response.body.data).toEqual(
        expect.objectContaining({
          punchIn: expect.any(String),
          punchOut: expect.any(String),
          employeeID: "test",
          uId: expect.any(String),
        })
      );

      expect(attendanceRequestController.create_request).toHaveBeenCalledTimes(
        1
      );
    });

    test("should return 200 when get_by_id is successful", async () => {
      attendanceRequestController.get_by_id.mockImplementation(
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
        "/api/attendance-request/some-id"
      );

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(
        expect.objectContaining({
          uId: "some-id",
        })
      );

      expect(attendanceRequestController.get_by_id).toHaveBeenCalledTimes(1);
    });

    test("should return 404 if no attendance record", async () => {
      attendanceRequestController.get_by_id.mockImplementation(
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
            res.status(404).json({ error: "Attendance record not found" });
          }
        }
      );

      const response = await request(app).get(
        "/api/attendance-request/some-id"
      );

      expect(response.status).toBe(404);
      expect(response.body.error).toEqual("Attendance record not found");

      expect(attendanceRequestController.get_by_id).toHaveBeenCalledTimes(1);
    });

    test("should return 200 on success update status", async () => {
      attendanceRequestController.update_status.mockImplementation(
        async (req, res, next) => {
          try {
            const findOneAndUpdateSpy = jest.spyOn(
              AttendanceRequestModel,
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
        .put("/api/attendance-request/test")
        .send({
          isHr: {
            status: "Sucess",
            comment: "test",
          },
          isManager: {
            status: "Pending",
            comment: "test",
          },
        });

      expect(response.status).toBe(200);
    });

    test("should return 400 on failure update status", async () => {
      attendanceRequestController.update_status.mockImplementation(
        async (req, res) => {
          try {
            const findOneAndUpdateSpy = jest.spyOn(
              AttendanceRequestModel,
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
        }
      );

      const response = await request(app)
        .put("/api/attendance-request/test")
        .send({
          isHr: {
            status: "Sucess",
            comment: "test",
          },
          isManager: {
            status: "Pending",
            comment: "test",
          },
        });

      expect(response.status).toBe(404);
      expect(attendanceRequestController.update_status).toHaveBeenCalledTimes(
        1
      );
    });

    test("should return 200 with attendance records for a valid query", async () => {
      attendanceRequestController.get_by_query.mockImplementation(
        async (req, res, next) => {
          const { location, department } = req.query;

          const query = {
            ...(location && { location }),
            ...(department && { department }),
          };

          if (Object.keys(query).length === 0) {
            return res.status(400).json({ error: "Invalid query parameters" });
          }
          jest.spyOn(AttendanceRequestModel, "find").mockResolvedValue([{}]);

          res.status(200).json({ attendances: [{}] });
        }
      );

      const response = await request(app)
        .get("/api/attendance-request")
        .query({
          location: "Office A",
          department: "IT",
        })
        .expect(200);

      expect(response.body.attendances).toHaveLength(1);

      expect(attendanceRequestController.get_by_query).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.any(Object),
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    test("should return 400 for an invalid query", async () => {
      attendanceRequestController.get_by_query.mockImplementation(
        async (req, res, next) => {
          const { location, department } = req.query;

          const query = {
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
        .get("/api/attendance-request")
        .query({
          az: "Office A",
        })
        .expect(400);

      expect(response.body.error).toBe("Invalid query parameters");

      expect(attendanceRequestController.get_by_query).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.any(Object),
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    test("should return 200 when success delete request", async () => {
      attendanceRequestController.delete_by_id.mockImplementation(
        async (req, res, next) => {
          const { id } = req.params;

          if (!id) {
            return res.status(400).json({ error: "Invalid request" });
          }

          try {
            const findOneAndDeleteSpy = jest.spyOn(
              AttendanceRequestModel,
              "findOneAndDelete"
            );
            findOneAndDeleteSpy.mockResolvedValue({
              uId: id,
              name: "John Doe",
              location: "Office A",
              department: "IT",
            });

            const result = await AttendanceRequestModel.findOneAndDelete({
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

      const response = await request(app).delete(
        "/api/attendance-request/test"
      );
      expect(response.status).toBe(200);
    });
  });
});
