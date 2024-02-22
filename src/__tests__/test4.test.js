import AttendancesModel from "../models/attendances.model.js";
import { userlogin, getDataByToken } from "../services/employee.js";
import request from "supertest";
import app from "../../app.js";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import path from "path";

jest.mock("aws-sdk", () => ({
  S3: jest.fn().mockImplementation(() => ({
    upload: jest.fn().mockReturnThis(),
    promise: jest
      .fn()
      .mockResolvedValue({ Location: "https://your-uploaded-url.com" }),
  })),
}));

jest.mock("../services/employee.js", () => ({
  userlogin: jest.fn(() => ({
    success: true,
    data: {
      token: "mocked_token",
    },
  })),
  getDataByToken: jest.fn(),
}));

jest.mock("../controllers/attendance.controller.js", () => ({
  punch_in: jest.fn(),
  punch_out: jest.fn(),
  get_by_query: jest.fn(),
}));

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

let mongoServer;

beforeAll(async () => {
  if (!mongoose.connection.readyState) {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`Connected to in-memory MongoDB: ${mongoUri}`);
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
    console.log("Disconnected from in-memory MongoDB");
  }
});

describe("Punch-In Functionality", () => {
  it("should allow punching in with a valid token", async () => {
    const token = "mocked_token";

    AttendancesModel.find.mockResolvedValue([]);

    userlogin.mockResolvedValue({ success: true, data: { token } });

    getDataByToken.mockResolvedValue({
      success: true,
      data: {
        userLogin: {
          _id: "659acf8f926cd3dbc75f937f",
          organizationID: "asdlj3343",
          userInformationID: "ast53a1223dgs",
          uId: "dd990243-9152-401c-bcff-dc47744b1d4e",
          firstName: "aldi",
          lastName: "krs",
          username: "reass@092",
          email: "user2@gmail.com",
          role: "admin",
          phoneNumber: 889348934,
          photo:
            "https://bluesilo-eprofile.s3.ap-southeast-1.amazonaws.com/uploads/1704644495328-Screenshot%202023-12-30%20214357.png",
          createdAt: "2024-01-07T16:21:35.846Z",
          updatedAt: "2024-01-07T16:21:35.846Z",
        },
      },
    });

    AttendancesModel.create.mockResolvedValue({});

    const imagePath = path.resolve(
      __dirname,
      "/BlueSilo-proj/attendance-be/src/__tests__/img/ad.jpg"
    );

    const response = await request(app)
      .post("/api/attendance/punch-in")
      .set("Authorization", `Bearer ${token}`)
      .attach("punchInImage", imagePath);

    expect(response.status).toBe(201);
  });
});
