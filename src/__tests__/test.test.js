import attendancesController from "../controllers/attendance.controller.js";
import AttendancesModel from "../models/attendances.model";
import { createRequest, createResponse } from "node-mocks-http";
import { uploadFile } from "../utils/aws";

jest.mock("../models/attendances.model", () => ({
  create: jest.fn(),
  findOneAndUpdate: jest.fn(),
  findOneAndDelete: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  sort: jest.fn(),
}));

jest.mock("../controllers/attendance.controller.js", () => ({
  punch_in: jest.fn(),
  punch_out: jest.fn(),
  get_by_query: jest.fn(),
  get_by_id: jest.fn(),
}));

jest.mock("../utils/aws", () => ({
  uploadFile: jest.fn().mockImplementation(() =>
    Promise.resolve({
      Location: "https://example.com/uploads/file.jpg",
    })
  ),
}));

describe("AttendancesController", () => {
  describe("punch_in", () => {
    it("should create a new attendance record if the last record has a punch out", async () => {
      const req = {
        file: "mocked-file",
        user: {
          userLogin: {
            uId: "mocked-employee-id",
            organizationID: "mocked-organization-id",
          },
        },
        body: {},
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      AttendancesModel.find.mockResolvedValue([]);

      const createdData = { _id: "mocked-id", punchIn: new Date() };
      AttendancesModel.create.mockResolvedValue(createdData);

      await attendancesController.punch_in(req, res, next);

      expect(AttendancesModel.find).toHaveBeenCalledWith({
        employeeID: "mocked-employee-id",
      });

      expect(AttendancesModel.create).toHaveBeenCalledWith({
        ...req.body,
        employeeID: "mocked-employee-id",
        organizationID: "mocked-organization-id",
        uId: expect.any(String),
        punchIn: expect.any(Date),
        punchInImage: expect.any(String),
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ data: createdData });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
