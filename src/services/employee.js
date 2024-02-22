import asyncHandler from 'express-async-handler';

import request from '../utils/request.js';

const getDataById = asyncHandler(async (uId) => {
  try {
    const resultData = await request.userAxios.get(`/api/user/${uId}`);
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
    const resultData = await request.userAxios.get(`/api/user/checkToken`);
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

const getEmployeeinformation = asyncHandler(async (uId) => {
  try {
    const resultData = await request.userAxios.get(`/api/user/${uId}`);
    console.log(resultData.data);
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

export { getDataById, getDataByToken, getEmployeeinformation };
