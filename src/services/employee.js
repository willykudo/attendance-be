import asyncHandler from "express-async-handler";
import FormData from "form-data";
import fs from "fs";

import request from "../utils/request.js";

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
        : "Failed get data",
    };
  }
});

export { getDataById };
