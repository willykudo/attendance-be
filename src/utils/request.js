import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const userAxios = axios.create({
  baseURL: process.env.USER_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default { userAxios };
