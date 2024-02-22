import dbServer, { punchInData } from "./dbServer/dbServer.js";
import attendancesController from "../controllers/attendance.controller.js";
import request from "supertest";
import path from "path";
import mongoose from "mongoose";
import app from "../../app.js";
import { userlogin } from "../services/employee.js";
import env from "dotenv";
env.config();

let token;
let mongoServer;

const mockModel = {
  findOne: jest.fn(),
  create: jest.fn(),
  countDocuments: jest.fn(),
  find: jest.fn(),
  sort: jest.fn(),
  limit: jest.fn(),
  skip: jest.fn(),
  findOneAndUpdate: jest.fn(),
  findOneAndDelete: jest.fn(),
};

beforeAll(async () => {
  mongoServer = await dbServer();
  attendancesController.model = mockModel;

  const data = await userlogin({
    email: "user2@gmail.com",
    password: "123456",
  });

  token = data.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  jest.clearAllMocks();
});

describe("POST /api/attendances", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 200 if create attendance success", async () => {
    mockModel.findOne.mockResolvedValue(null);

    mockModel.create.mockResolvedValue({ punchInData });

    const imagePath = path.resolve(
      __dirname,
      "/BlueSilo-proj/attendance-be/src/__tests__/img/ad.jpg"
    );

    const res = await request(app)
      .post("/api/attendance/punch-in")
      .set("Authorization", `Bearer ${token}`)
      .attach("punchInImage", imagePath);

    expect(res.statusCode).toBe(201);
  });
});
