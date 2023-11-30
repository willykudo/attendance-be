

import asyncHandler from "express-async-handler";
import { customizeError } from "../utils/common.js";

const isAuthorized = asyncHandler(async (req, res, next) => {
    let token;
    try {
      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
      ) {
        token = req.headers.authorization.split(" ")[1];
        // put your logic here

        next();
      } else {
        throw customizeError(401, "No token found");
      }
    } catch (err) {
      next(err)
    }
});


export { 
  isAuthorized,
};
