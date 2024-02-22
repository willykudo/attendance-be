import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import AttendancesModel from "../../models/attendances.model";

export const punchInData = {
  uId: "employee123",
  punchIn: new Date(),
  location: "test",
  department: "test",
  punchInGps: {
    address: "test",
    lat: "test",
    long: "test",
    postalcode: "test",
  },
};

export default function dbServer() {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    await new AttendancesModel(punchInData).save();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });
}
