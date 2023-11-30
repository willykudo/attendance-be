import asyncHandler from "express-async-handler";
import FormData from "form-data";
import fs from "fs";

import request from "../utils/request.js";


const loginForUser = asyncHandler(async (data) => {
  try {
    const resultData = await request.post(`/api/auth/login`, data);

    return { success: true, data: resultData.data }

  } catch (error) {
    return { 
      success: false,
      status: error?.response?.status ? error?.response?.status : 500,
      message: error?.response?.data?.message ? error?.response?.data?.message : "Login Failed"
    }
    
  }
});

const loginForSuperAdmin = asyncHandler(async (data) => {
  try {
    const resultData = await request.post(`/api/auth/admin/login`, data);

    return { success: true, data: resultData.data }
    
  } catch (error) {
    return { 
      success: false,
      status: error?.response?.status ? error?.response?.status : 500,
      message: error?.response?.data?.message ? error?.response?.data?.message : "Login Failed"
    }
    
  }
});

const regisUser = asyncHandler(async (data) => {
  try {
    
    const resultData = await request.post(`/api/auth/admin/register`, {
      ...data.user,
      appAccessControls: ["HR-Leave", "Eprofile"],
      organizations: [data.organization.uId]
    });

    return { success: true, data: resultData.data }
    
  } catch (error) {
    return { 
      success: false,
      status: error?.response?.status ? error?.response?.status : 500,
      message: error?.response?.data?.message ? error?.response?.data?.message : "Failed register user"
    }
  }
});

const regisCorp = asyncHandler(async (data) => {
  try {
    
  const resultData = await request.post(`/api/auth/admin/corporate`, data);

  return { success: true, data: resultData.data }
    
  } catch (error) {
    return { 
      success: false,
      status: error?.response?.status ? error?.response?.status : 500,
      message: error?.response?.data?.message ? error?.response?.data?.message : "Failed create corp"
    }
    
  }
});

const userChangeEpPassword = asyncHandler(async (userId, data) => {
  try {
    
    const resultData = await request.put(`/api/user/users/password/${userId}`, data);

    return { success: true, data: resultData.data }
    
  } catch (error) {
    return { 
      success: false,
      status: error?.response?.status ? error?.response?.status : 500,
      message: error?.response?.data?.message ? error?.response?.data?.message : "Failed change user password"
    }
  }
});

const changeEProfilePic = asyncHandler(async (userId, data) => {
  try {
    const formAxios = new FormData();
		if (data.files && data.files.profile) {
			formAxios.append("profile", fs.createReadStream(data.files.profile[0].path));

			const resultData = await request.put(`/api/user/users/${userId}`, formAxios, {
        headers: {
          ... formAxios.getHeaders()
        }
      });
      return { success: true, data: resultData.data }
		} else {
      return { 
        success: false,
        status: 400,
        message: "Failed change user profile"
      }
    }
    
  } catch (error) {
    return { 
      success: false,
      status: error?.response?.status ? error?.response?.status : 500,
      message: error?.response?.data?.message ? error?.response?.data?.message : "Failed change user profile"
    }
  }
});

const getEpUsers = asyncHandler(async (filter) => {
  try {
    
    const resultData = await request.get(`/api/user/users/list/filter`, filter);

    return { success: true, data: resultData.data }
    
  } catch (error) {
    return { 
      success: false,
      status: error?.response?.status ? error?.response?.status : 500,
      message: error?.response?.data?.message ? error?.response?.data?.message : "Failed change user password"
    }
  }
});

const adminAddEpUser = asyncHandler(async (data) => {
  try {
    
    const resultData = await request.post(`/api/user/users`, data);

    return { success: true, data: resultData.data }
    
  } catch (error) {
    return { 
      success: false,
      status: error?.response?.status ? error?.response?.status : 500,
      message: error?.response?.data?.message ? error?.response?.data?.message : "Failed register user"
    }
  }
});

const getEpUser = asyncHandler(async (userId) => {
  try {
      
    const resultData = await request.get(`/api/user/users/${userId}`);

    return { success: true, data: resultData.data }
    
  } catch (error) {
    return { 
      success: false,
      status: error?.response?.status ? error?.response?.status : 500,
      message: error?.response?.data?.message ? error?.response?.data?.message : "get user"
    }
    
  }
});

const getEpUserSearch = asyncHandler(async (datas) => {
  try {
    let input = [];
    for (const key in datas) {
      const element = datas[key];
      const textTobe = `${key}=${element}`;
      input.push(textTobe)
    }
    const finalInput = input.join("&");


    const resultData = await request.get(`/api/user/users/match/?${finalInput}`);

    return { success: true, data: resultData.data }
    
  } catch (error) {
    return { 
      success: false,
      status: error?.response?.status ? error?.response?.status : 500,
      message: error?.response?.data?.message ? error?.response?.data?.message : "get user"
    }
    
  }
});

const adminEditEpUser = asyncHandler(async (userId, data) => {
  try {
    
    const resultData = await request.put(`/api/user/users/${userId}`, data);

    return { success: true, data: resultData.data }
    
  } catch (error) {
    return { 
      success: false,
      status: error?.response?.status ? error?.response?.status : 500,
      message: error?.response?.data?.message ? error?.response?.data?.message : "Failed register user"
    }
  }
});

const createEpLicense = asyncHandler(async (data) => {
  try {
    
    const resultData = await request.post(`/api/admin/licenses/`, data);

    return { success: true, data: resultData.data }
    
  } catch (error) {
    return { 
      success: false,
      status: error?.response?.status ? error?.response?.status : 500,
      message: error?.response?.data?.message ? error?.response?.data?.message : "Failed create license"
    }
    
  }
});

const getEpPendingApprovals = asyncHandler(async (data) => {
  try {
    
    const resultData = await request.get(`/api/admin/users/filter`, data);

    return { success: true, data: resultData.data }
    
  } catch (error) {
    return { 
      success: false,
      status: error?.response?.status ? error?.response?.status : 500,
      message: error?.response?.data?.message ? error?.response?.data?.message : "get pending approval"
    }
    
  }
});

const approveUserEp = asyncHandler(async (data) => {
  try {
    
    const resultData = await request.put(`/api/admin/users/${data.uId}`, data.input);

    return { success: true, data: resultData.data }
    
  } catch (error) {
    return { 
      success: false,
      status: error?.response?.status ? error?.response?.status : 500,
      message: error?.response?.data?.message ? error?.response?.data?.message : "Failed approve user"
    }
    
  }
});

const updateOwnCorp = asyncHandler(async (data) => {
  try {
    
    const resultData = await request.put(`/api/user/corporates/${data.uId}`, data.input);

    return { success: true, data: resultData.data }
    
  } catch (error) {
    return { 
      success: false,
      status: error?.response?.status ? error?.response?.status : 500,
      message: error?.response?.data?.message ? error?.response?.data?.message : "Failed update corp"
    }
    
  }
});

const getOwnCorpDetail = asyncHandler(async (uId) => {
  try {
    
    const resultData = await request.get(`/api/user/corporates/${uId}`);

    return { success: true, data: resultData.data }
  } catch (error) {
    return { 
      success: false,
      status: error?.response?.status ? error?.response?.status : 500,
      message: error?.response?.data?.message ? error?.response?.data?.message : "get corp"
    }
    
  }
});

const getOwnCorpIds = asyncHandler(async (uIds) => {
  try {
    let input = [];
    for (let i = 0; i < uIds.length; i++) {
      const element = uIds[i];
      const textTobe = `uIds=${element}`;
      input.push(textTobe)
    }
    const finalInput = input.join("&");

    const resultData = await request.get(`/api/user/corporates/list/uIds?${finalInput}`);

    return { success: true, data: resultData.data }
  } catch (error) {
    return { 
      success: false,
      status: error?.response?.status ? error?.response?.status : 500,
      message: error?.response?.data?.message ? error?.response?.data?.message : "Failed get corp"
    }
    
  }
});

const checkEPToken = asyncHandler(async (data) => {
  try {
    
    const resultData = await request.get(`/api/auth/checkToken`);

    return { success: true, data: resultData.data }
    
  } catch (error) {
    return { 
      success: false,
      status: error?.response?.status ? error?.response?.status : 500,
      message: error?.response?.data?.message ? error?.response?.data?.message : "Failed check token"
    }
    
  }
});

const checkUserLicense = asyncHandler(async () => {
  try {
    
    const resultData = await request.get(`/api/auth/checkLicense/${process.env.APP_NAME}`);

    return { success: true, data: resultData.data }
  } catch (error) {
    return { 
      success: false,
      status: error?.response?.status ? error?.response?.status : 500,
      message: error?.response?.data?.message ? error?.response?.data?.message : "Failed check license"
    }
    
  }
});

const getUserDetailEpbyToken = asyncHandler(async () => {
  try {
    
    const resultData = await request.get(`/api/auth/getUserProfile`);

    return { success: true, data: resultData.data }
  } catch (error) {
    return { 
      success: false,
      status: error?.response?.status ? error?.response?.status : 500,
      message: error?.response?.data?.message ? error?.response?.data?.message : "Failed get user profile by token"
    }
    
  }
});

const getOrganizationLicense = asyncHandler(async (targetUid) => {
  try {
    
    const resultData = await request.get(`/api/admin/licenses/${targetUid}`);

    return { success: true, data: resultData.data }
  } catch (error) {
    return { 
      success: false,
      status: error?.response?.status ? error?.response?.status : 500,
      message: error?.response?.data?.message ? error?.response?.data?.message : "Failed get user profile by token"
    }
    
  }
});

const updateOrganizationLicense = asyncHandler(async (targetUid, dataInput) => {
  try {
    const resultData = await request.put(`/api/admin/licenses/${targetUid}`, dataInput);

    return { success: true, data: resultData.data }
  } catch (error) {
    return { 
      success: false,
      status: error?.response?.status ? error?.response?.status : 500,
      message: error?.response?.data?.message ? error?.response?.data?.message : "Failed get user profile by token"
    }
    
  }
});

const getAllApps = asyncHandler(async () => {
  try {
    const resultData = await request.get(`/api/user/apps`);

    return { success: true, data: resultData.data }
  } catch (error) {
    return { 
      success: false,
      status: error?.response?.status ? error?.response?.status : 500,
      message: error?.response?.data?.message ? error?.response?.data?.message : "Failed to get apps"
    }
  }
});

const getOrganizationWorkDay = asyncHandler(async(organizationId) => {
  try {
    const resultData = await request.get(`/api/user/workdays?organizationId=${organizationId}`);
    return { success: true, data: resultData.data }
  } catch (error) {
    return { 
      success: false,
      status: error?.response?.status ? error?.response?.status : 500,
      message: error?.response?.data?.message ? error?.response?.data?.message : "Failed to get Workday"
    }
  }
})

const updateOrganizationWorkDay = asyncHandler(async(data) => {
  try {
    const resultData = await request.put(`/api/user/workdays`,data);
    return { success: true, data: resultData }
  } catch (error) {
    return { 
      success: false,
      status: error?.response?.status ? error?.response?.status : 500,
      message: error?.response?.data?.message ? error?.response?.data?.message : "Failed to update Workday"
    }
  }
})

const getDepartmentList = asyncHandler(async(organizationId)=>{  
  try {
    const resultData = await request.get(`/api/user/departments?organizationId=${organizationId}`);
    return { success: true, data: resultData.data.data }
  } catch (error) {
    return { 
      success: false,
      status: error?.response?.status ? error?.response?.status : 500,
      message: error?.response?.data?.message ? error?.response?.data?.message : "Failed to get Department List"
    }
  }
})

const createDepartmentList = asyncHandler(async(departmentData)=>{  
  try {
    const resultData = await request.post(`/api/user/departments/`,departmentData);
    return { success: true, data: resultData}
  } catch (error) {
    return { 
      success: false,
      status: error?.response?.status ? error?.response?.status : 500,
      message: error?.response?.data?.message ? error?.response?.data?.message : "Failed to update Department List"
    }
  }
})

const updateDepartmentList = asyncHandler(async(departmentData)=>{  
  try {
    const resultData = await request.put(`/api/user/departments/${departmentData.uId}`,departmentData);    
    return { success: true, data: resultData}
  } catch (error) {
    return { 
      success: false,
      status: error?.response?.status ? error?.response?.status : 500,
      message: error?.response?.data?.message ? error?.response?.data?.message : "Failed to update Department List"
    }
  }
})

const removeDepartmentList = asyncHandler(async(departmentId)=>{  
  try {
    const resultData = await request.delete(`/api/user/departments/${departmentId}`);
    return { success: true, data: resultData}
  } catch (error) {
    return { 
      success: false,
      status: error?.response?.status ? error?.response?.status : 500,
      message: error?.response?.data?.message ? error?.response?.data?.message : "Failed to Delete Department List"
    }
  }
})

const getOrganizationHoliday = asyncHandler(async(organizationId)=>{  
  try {
    const resultData = await request.get(`/api/user/holidays?organizationId=${organizationId}`);
    return { success: true, data: resultData.data.data }
  } catch (error) {
    return { 
      success: false,
      status: error?.response?.status ? error?.response?.status : 500,
      message: error?.response?.data?.message ? error?.response?.data?.message : "Failed to get Organization Holidays"
    }
  }
})

const createOrganizationHoliday = asyncHandler(async(holidayData)=>{  
  try {
    const resultData = await request.post(`/api/user/holidays/`,holidayData);
    return { success: true, data: resultData }
  } catch (error) {
    return { 
      success: false,
      status: error?.response?.status ? error?.response?.status : 500,
      message: error?.response?.data?.message ? error?.response?.data?.message : "Failed to create Organization Holidays"
    }
  }
})

const updateOrganizationHoliday = asyncHandler(async(holidayData)=>{  
  try {
    const resultData = await request.put(`/api/user/holidays/${holidayData.uId}`,holidayData);
    return { success: true, data: resultData }
  } catch (error) {
    return { 
      success: false,
      status: error?.response?.status ? error?.response?.status : 500,
      message: error?.response?.data?.message ? error?.response?.data?.message : "Failed to update Organization Holidays"
    }
  }
})

const removeOrganizationHoliday = asyncHandler(async(holidayId)=>{  
  try {
    const resultData = await request.delete(`/api/user/holidays/${holidayId}`);
    return { success: true, data: resultData }
  } catch (error) {
    return { 
      success: false,
      status: error?.response?.status ? error?.response?.status : 500,
      message: error?.response?.data?.message ? error?.response?.data?.message : "Failed to delete Organization Holidays"
    }
  }
})

const updateEpUser = asyncHandler(async(userData)=>{
  try {
    const resultData = await request.put(`/api/user/users/${userData.uId}`,userData);
    return { success: true, data: resultData }
  } catch (error) {
    return { 
      success: false,
      status: error?.response?.status ? error?.response?.status : 500,
      message: error?.response?.data?.message ? error?.response?.data?.message : "Failed to update User Data in Eprofile"
    }
  }
});

export {
  loginForUser,
  loginForSuperAdmin,
  regisUser,
  regisCorp,
  userChangeEpPassword,
  changeEProfilePic,
  getEpUsers,
  adminAddEpUser,
  getEpUser,
  updateEpUser,
  getEpUserSearch,
  adminEditEpUser,
  createEpLicense,
  getEpPendingApprovals,
  approveUserEp,
  getOwnCorpDetail,
  getOwnCorpIds,
  updateOwnCorp,
  checkUserLicense,
  checkEPToken,
  getUserDetailEpbyToken,
  getOrganizationLicense,
  updateOrganizationLicense,
  getAllApps,
  getOrganizationWorkDay,
  updateOrganizationWorkDay,
  getDepartmentList,
  createDepartmentList,
  updateDepartmentList,
  removeDepartmentList,
  getOrganizationHoliday,
  createOrganizationHoliday,
  updateOrganizationHoliday,
  removeOrganizationHoliday,

}
