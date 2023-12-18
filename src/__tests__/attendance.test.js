import AttendancesController from "../controllers/attendance.controller.js";

it("should successfully punch in with valid data", async () => {
  const req = {
    file: {
      path: "BlueSilo-proj/attendance-be/uploads/17.jpg",
      originalname: "file.jpg",
      mimetype: "image/jpeg",
    },
    body: {
      // valid request body data
    },
  };

  const res = {
    status: function (statusCode) {
      return this;
    },
    json: function (data) {
      expect(statusCode).toBe(201);
      expect(data).toHaveProperty("data");
      // add more assertions if needed
    },
  };

  const next = function (error) {
    console.error(error);
  };

  await AttendancesController.punch_in(req, res, next);
}, 10000); // 10 seconds timeout
