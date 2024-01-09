import asyncHandler from "express-async-handler";
import { customizeError } from "../utils/common.js";
import request from "../utils/request.js";
import jwt from "jsonwebtoken";

const isAuthorized = asyncHandler(async (req, res, next) => {
  let token;
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
      request.userAxios.defaults.headers.common["authorization"] = token;
      // request.userAxios.defaults.headers.common["organizationID"] =
      //   req.headers.organizationID;

      const secretKey = process.env.JWT_SECRET;

      // Token Validation
      jwt.verify(token, secretKey, (err, decoded) => {
        if (err) return res.sendStatus(403);

        req.user = decoded;
      });

      next();
    } else {
      throw customizeError(401, "No token found");
    }
  } catch (err) {
    next(err);
  }
});

export { isAuthorized };
