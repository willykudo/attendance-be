import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const employeeAxios = axios.create({
  baseURL: process.env.EMPLOYEE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default { employeeAxios };
