import request from "supertest";
import app from "../../app.js";
import AttendanceSettingModel from "../models/attendanceSetting.model.js";
import attendanceSettingController from "../controllers/attendanceSetting.controller.js";

jest.mock("../models/attendanceSetting.model.js", () => {
  return {
    create: jest.fn(),
    findOneAndUpdate: jest.fn(),
    find: jest.fn(),
    findOneAndDelete: jest.fn(),
    countDocuments: jest.fn(),
  };
});

jest.mock("../controllers/attendanceSetting.controller.js", () => {
  return {
    get_settings: jest.fn(),
    create_setting: jest.fn(),
    update_settings: jest.fn(),
  };
});

describe("Attendance Setting", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe("/api/attendanceSetting", () => {
    test("should return 201 when create_setting is successful", async () => {
      attendanceSettingController.create_setting.mockImplementation(
        async (req, res, next) => {
          try {
            const createSpy = jest.spyOn(AttendanceSettingModel, "create");
            const mockNewData = req.body;
            const mockCreatedData = {
              ...mockNewData,
            };
            createSpy.mockResolvedValue(mockCreatedData);

            return res.status(201).json({ data: mockCreatedData });
          } catch (error) {
            next(error);
          }
        }
      );

      const response = await request(app)
        .post("/api/attendance-setting/create")
        .send({
          uId: "some-id",
        })
        .expect(201);

      expect(response.body.data).toHaveProperty("uId", "some-id");

      expect(attendanceSettingController.create_setting).toHaveBeenCalledTimes(
        1
      );
    });

    test("should return 200 when update is successful", async () => {
      attendanceSettingController.update_settings.mockImplementation(
        async (req, res, next) => {
          try {
            const { id } = req.params;

            const findOneAndUpdateSpy = jest.spyOn(
              AttendanceSettingModel,
              "findOneAndUpdate"
            );

            const mockUpdatedData = {
              ...req.body,
              uId: id,
            };

            findOneAndUpdateSpy.mockResolvedValue(mockUpdatedData);

            return res.status(200).json({ data: mockUpdatedData });
          } catch (error) {
            next(error);
          }
        }
      );

      const response = await request(app)
        .put("/api/attendance-setting/some-id")
        .send({
          someField: "updatedValue",
        })
        .expect(200);

      expect(response.body.data).toEqual(
        expect.objectContaining({
          uId: "some-id",
          someField: "updatedValue",
        })
      );

      expect(attendanceSettingController.update_settings).toHaveBeenCalledTimes(
        1
      );
    });

    test("should return 200 when get_settings is successful", async () => {
      attendanceSettingController.get_settings.mockImplementation(
        async (req, res, next) => {
          try {
            const findSpy = jest.spyOn(AttendanceSettingModel, "find");
            const mockData = [
              {
                someData: "someData",
              },
            ];
            findSpy.mockResolvedValue(mockData);

            return res.status(200).json({
              status: 200,
              message: "success",
              data: mockData,
            });
          } catch (error) {
            next(error);
          }
        }
      );

      const response = await request(app)
        .get("/api/attendance-setting")
        .expect(200);

      expect(response.body.data).toEqual(
        expect.arrayContaining([
          {
            someData: "someData",
          },
        ])
      );

      expect(attendanceSettingController.get_settings).toHaveBeenCalledTimes(1);
    });
  });
});
