import request from "supertest";
import app from "../../app.js";
import AttendanceSettingModel from "../models/attendanceSetting.model.js";
import { attendanceSetting } from "../utils/mockData.js";

jest.mock("../models/attendanceSetting.model.js", () => {
  return {
    create: jest.fn(),
    findOneAndUpdate: jest.fn(),
    find: jest.fn(),
    findOneAndDelete: jest.fn(),
    countDocuments: jest.fn(),
  };
});

describe("Attendance Setting", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe("/api/attendanceSetting", () => {
    test("should return 201 on success creating new AttendanceSetting", async () => {
      AttendanceSettingModel.create.mockResolvedValue(attendanceSetting);

      const response = await request(app)
        .post("/api/attendance-setting/create")
        .send(attendanceSetting);
      expect(response.status).toBe(201);
      console.log(response.body);
      expect(response.body).toHaveProperty("data", attendanceSetting);
    });

    test("should return 200 on success updating attendance setting", async () => {
      AttendanceSettingModel.findOneAndUpdate.mockResolvedValue(
        attendanceSetting
      );
      const response = await request(app).put(
        `/api/attendance-setting/${attendanceSetting.uId}`
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("data", attendanceSetting);
    });

    test("should return 200 on success get data", async () => {
      AttendanceSettingModel.find.mockResolvedValue(attendanceSetting);

      const response = await request(app)
        .get("/api/attendance-setting")
        .expect(200);

      expect(response.body.status).toBe(200);
      expect(response.body.message).toBe("success");
      expect(response.body.data).toBeDefined();
      expect(AttendanceSettingModel.find).toHaveBeenCalledTimes(1);
    });

    test("should return 500 if no settings found", async () => {
      AttendanceSettingModel.find.mockResolvedValueOnce(null);
      const response = await request(app).get("/api/attendance-setting/");

      expect(response.statusCode).toBe(500);
      expect(response.body.message).toBe("No data found");
    });
  });
});
