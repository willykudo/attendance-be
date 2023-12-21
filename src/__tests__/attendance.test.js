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
    test("should return 201 on success upload file", async () => {
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

      // Assert the response status
      expect(response.status).toBe(201);
      expect(attendancesController.punch_in).toHaveBeenCalledTimes(1);
      expect(response.body).toHaveProperty("data", expectedData);
    });

    test("should return 200 on success", async () => {
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

      // Additional assertions for the response body
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

      // Assert the response status
      expect(response.status).toBe(400);

      expect(attendancesController.get_by_query).toHaveBeenCalledTimes(1);

      // Additional assertions for the response body
      expect(response.body).toHaveProperty("error", "Invalid query parameters");
    });
  });
});
