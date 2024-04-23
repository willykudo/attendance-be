import asyncHandler from 'express-async-handler';

import request from '../utils/request.js';

const getDataById = asyncHandler(async (uId) => {
  try {
    const resultData = await request.employeeAxios.get(`/api/user/${uId}`);
    return { success: true, data: resultData.data };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      status: error?.response?.status ? error?.response?.status : 500,
      message: error?.response?.data?.message
        ? error?.response?.data?.message
        : 'Failed get data',
    };
  }
});

const getDataByToken = asyncHandler(async () => {
  try {
    const resultData = await request.employeeAxios.get(`/api/user/checkToken`);
    return { success: true, data: resultData.data };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      status: error?.response?.status ? error?.response?.status : 500,
      message: error?.response?.data?.message
        ? error?.response?.data?.message
        : 'Failed get data',
    };
  }
});

let countFetch = 0;

const getEmployeeinformation = asyncHandler(async () => {
  try {
    const resultData = await request.employeeAxios.get(`/api/user`);
    countFetch++;
    console.log('employeeData called times: ', countFetch);
    return { success: true, data: resultData.data };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      status: error?.response?.status ? error?.response?.status : 500,
      message: error?.response?.data?.message
        ? error?.response?.data?.message
        : 'Failed get data',
    };
  }
});

const employeeInfoCache = {};

const getEmployeeInformationWithCache = asyncHandler(async (employeeID) => {
  if (employeeInfoCache[employeeID]) {
    return employeeInfoCache[employeeID];
  }

  try {
    // Get data from cache
    const resultData = await request.employeeAxios.get(`/api/user/${employeeID}`);

    // Store data to cache
    employeeInfoCache[employeeID] = {
      success: true,
      data: resultData.data,
    };

    return employeeInfoCache[employeeID];
  } catch (error) {
    console.log(error);
    return {
      success: false,
      status: error?.response?.status ? error?.response?.status : 500,
      message: error?.response?.data?.message
        ? error?.response?.data?.message
        : 'Failed to get data',
    };
  }
});

export {
  getDataById,
  getDataByToken,
  getEmployeeinformation,
  getEmployeeInformationWithCache,
};
