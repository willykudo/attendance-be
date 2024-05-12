import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const employeeAxios = axios.create({
  baseURL: process.env.USER_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default { employeeAxios };
