import httpMocks from "node-mocks-http";
import AttendancesModel from "../models/attendances.model.js";
import attendancesController from "../controllers/attendance.controller.js";

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
  };
});

jest.mock("../utils/aws.js", () => {
  return {
    uploadFile: jest.fn(() =>
      Promise.resolve({ Location: "mockedUploadLocation" })
    ),
  };
});

describe("AttendancesController", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 201 when successfully create a new attendance", async () => {
    const request = httpMocks.createRequest({
      user: {
        userLogin: {
          uId: "mockedUserId",
          organizationID: "mockedOrganizationId",
        },
      },
      file: {
        fieldname: "punchInImage",
        originalname: "Screenshot 2023-12-30 214357.png",
        encoding: "7bit",
        mimetype: "image/png",
        path: "/mockedImage/2023-12-30-214357.png",
      },
      body: {
        location: "test",
      },
    });
    const response = httpMocks.createResponse();

    AttendancesModel.find.mockResolvedValue([]);

    const mockCreatedAttendance = {
      uId: "test",
      employeeID: "mockedUserId",
      organizationID: "mockedOrganizationId",
      punchIn: new Date(),
      punchInImage: "mockedUploadLocation",
    };

    const mockProduct = jest.fn(async () => {
      return { data: mockCreatedAttendance };
    });

    AttendancesModel.create.mockImplementation(mockProduct);

    await attendancesController.punch_in(request, response, jest.fn());

    expect(response.statusCode).toBe(200);
    expect(AttendancesModel.create).toHaveBeenCalledTimes(1);
  });
});
