import asyncHandler from 'express-async-handler';
import request from '../utils/request.js';

import { getDataByToken } from '../services/employee.js';

const isAuthorized = asyncHandler(async (req, res, next) => {
  let token;
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization;
      request.employeeAxios.defaults.headers.common['authorization'] = token;

      const { success, data } = await getDataByToken();

      if (!success) {
        res.status(401);
        throw new Error("User don't have access");
      }

      req.user = data;

      next();
    } else {
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  } catch (err) {
    next(err);
  }
});

export { isAuthorized };
