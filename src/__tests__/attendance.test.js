import request from "supertest";
import app from "../../app.js";
import AttendancesModel from "../models/attendances.model.js";
import attendancesController from "../controllers/attendance.controller.js";
import { upload } from "../utils/aws.js";
import fs from "fs";
import path from "path";

jest.mock("../models/attendances.model.js", () => {
  return {
    create: jest.fn(),
    findOneAndUpdate: jest.fn(),
    find: jest.fn(),
  };
});

jest.mock("../controllers/attendance.controller.js", () => {
  return {
    punch_in: jest.fn(),
    punch_out: jest.fn(),
    break: jest.fn(),
    return_from_break: jest.fn(),
    delete: jest.fn(),
    get_by_id: jest.fn(),
    get_by_query: jest.fn(),
  };
});

describe("Attendance", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe("POST /attendances", () => {
    test("should return 201 on success punch-in with uploaded file", async () => {
      const mockedUploadResult = {
        Location: "https://your-s3-bucket-url/th.jpg",
      };
      jest.mock("../utils/aws.js", () => {
        return {
          uploadFile: jest.fn(() => Promise.resolve(mockedUploadResult)),
        };
      });

      const mockedCreatedData = {
        uId: "testUuid",
        punchIn: new Date(),
        punchInImage: mockedUploadResult.Location,
      };
      console.log(
        "🚀 ~ file: attendance.test.js:49 ~ test ~ mockedCreatedData:",
        mockedCreatedData
      );

      attendancesController.punch_in.mockImplementation(async (req, res) => {
        await res.status(201).json({ data: mockedCreatedData });
      });

      const imagePath = path.resolve(__dirname, "/th.jpg");
      const imageBuffer = fs.readFileSync(imagePath);
      console.log(
        "🚀 ~ file: attendance.test.js:35 ~ test ~ imageBuffer:",
        imageBuffer
      );

      const response = await request(app)
        .post("/api/attendance/punch-in")
        .field("uId", "test")
        .field("employeeID", "wada")
        .attach("punchInImage", imageBuffer);

      const expectedData = {
        ...mockedCreatedData,
        punchIn: mockedCreatedData.punchIn.toISOString(),
      };
      console.log(
        "🚀 ~ file: attendance.test.js:72 ~ test ~ expectedData:",
        expectedData
      );
      console.log("response.body:", response.body);

      expect(response.status).toBe(201);
      expect(attendancesController.punch_in).toHaveBeenCalledTimes(1);
      expect(response.body).toHaveProperty("data", expectedData);
    });

    test("should return 400 if organizationID is missing in punch-in", async () => {
      attendancesController.punch_in.mockImplementation(async (req, res) => {
        await res.status(400).json({ error: "organizationID is required" });
      });

      const response = await request(app)
        .post("/api/attendance/punch-in")
        .field("uId", "test")
        .field("employeeID", "wada")
        .attach("punchInImage", "/th.jpg");

      expect(response.status).toBe(400);
      expect(attendancesController.punch_in).toHaveBeenCalledTimes(1);
      expect(response.body).toHaveProperty(
        "error",
        "organizationID is required"
      );
    });

    test("should return 200 on success get with query", async () => {
      const mockedAttendances = [
        { name: "John Doe", location: "Office", department: "IT" },
      ];
      attendancesController.get_by_query.mockImplementation(
        async (req, res) => {
          await res.status(200).json({ attendances: mockedAttendances });
        }
      );

      const response = await request(app).get("/api/attendance");

      expect(response.status).toBe(200);
      expect(attendancesController.get_by_query).toHaveBeenCalledTimes(1);
      expect(response.body).toHaveProperty("attendances", mockedAttendances);
    });

    test("should return 400 for invalid query parameters", async () => {
      attendancesController.get_by_query.mockImplementation(
        async (req, res) => {
          await res.status(400).json({ error: "Invalid query parameters" });
        }
      );

      // Make the request
      const response = await request(app).get("/api/attendance");

      expect(response.status).toBe(400);
      expect(attendancesController.get_by_query).toHaveBeenCalledTimes(1);
      expect(response.body).toHaveProperty("error", "Invalid query parameters");
    });

    test("should can add break", async () => {
      const mockedUploadResult = {
        Location: "https://your-s3-bucket-url/th.jpg",
      };
      jest.mock("../utils/aws.js", () => {
        return {
          uploadFile: jest.fn(() => Promise.resolve(mockedUploadResult)),
        };
      });

      const mockedBreakData = {
        uId: "someID",
        breakTime: new Date(),
        breakImage: mockedUploadResult.Location,
      };

      attendancesController.break.mockImplementation(async (req, res) => {
        await res.status(200).json({
          message: "Break added successfully",
          break: mockedBreakData,
        });
      });

      const response = await request(app)
        .put(`/api/attendance/break/${mockedBreakData.uId}`)
        .field("breakField", "value")
        .attach("breakImage", "/th.jpg");

      expect(response.status).toBe(200);

      expect(attendancesController.break).toHaveBeenCalledTimes(1);
      expect(response.body).toHaveProperty(
        "message",
        "Break added successfully"
      );
    });

    test("should can't add more break if the user does not return from the last breaks", async () => {
      const mockedUploadResult = {
        Location: "https://your-s3-bucket-url/th.jpg",
      };
      jest.mock("../utils/aws.js", () => {
        return {
          uploadFile: jest.fn(() => Promise.resolve(mockedUploadResult)),
        };
      });

      attendancesController.break.mockImplementation(async (req, res) => {
        await res
          .status(400)
          .json({ error: "Can't add break, please return from break first" });
      });

      const mockedBreakData = {
        uId: "someID",
        breakTime: new Date(),
        breakImage: mockedUploadResult.Location,
      };

      const response = await request(app)
        .put(`/api/attendance/break/${mockedBreakData.uId}`)
        .field("breakField", "value")
        .attach("breakImage", "/th.jpg");

      expect(response.status).toBe(400);

      expect(response.status).toBe(400);

      // Assert that the addBreak controller function was called once
      expect(attendancesController.break).toHaveBeenCalledTimes(1);

      expect(response.body).toHaveProperty(
        "error",
        "Can't add break, please return from break first"
      );
    });

    test("should return 400 if return from break is already recorded", async () => {
      attendancesController.return_from_break.mockImplementation(
        async (req, res) => {
          await res
            .status(400)
            .json({ error: "Return from break already recorded" });
        }
      );

      const mockedReturnFromBreakData = {
        uId: "alreadyRecordedID",
        returnDesc: "Some return description",
      };

      const response = await request(app)
        .put(`/api/attendance/return/${mockedReturnFromBreakData.uId}`)
        .field("returnDesc", mockedReturnFromBreakData.returnDesc)
        .attach("returnImage", "/th.jpg");

      expect(response.status).toBe(400);
      expect(attendancesController.return_from_break).toHaveBeenCalledTimes(1);
      expect(response.body).toHaveProperty(
        "error",
        "Return from break already recorded"
      );
    });

    test("should return 200 on successful return from break", async () => {
      const mockedUploadResult = {
        Location: "https://your-s3-bucket-url/th.jpg",
      };

      jest.mock("../utils/aws.js", () => ({
        uploadFile: jest.fn(() => Promise.resolve(mockedUploadResult)),
      }));

      attendancesController.return_from_break.mockImplementation(
        async (req, res) => {
          await res.status(200).json({
            message: "Return from break recorded successfully",
            return: {
              returnFromBreak: new Date(),
              returnDesc: req.body.returnDesc,
              returnImage: mockedUploadResult.Location,
            },
          });
        }
      );

      const mockedReturnFromBreakData = {
        uId: "somUid",
        returnDesc: "Some return description",
      };

      const response = await request(app)
        .put(`/api/attendance/return/${mockedReturnFromBreakData.uId}`)
        .field("returnDesc", mockedReturnFromBreakData.returnDesc)
        .attach("returnImage", "/th.jpg");

      expect(response.status).toBe(200);
      expect(attendancesController.return_from_break).toHaveBeenCalledTimes(1);
      expect(response.body).toHaveProperty(
        "message",
        "Return from break recorded successfully"
      );
      expect(response.body).toHaveProperty("return.returnFromBreak");
      expect(response.body).toHaveProperty(
        "return.returnDesc",
        mockedReturnFromBreakData.returnDesc
      );
      expect(response.body).toHaveProperty(
        "return.returnImage",
        mockedUploadResult.Location
      );
    });
  });
});
