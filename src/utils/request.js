import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const customAxios = axios.create({
  baseURL: process.env.ENTITY_API_URL,
  headers: {
    "Content-Type": "application/json",
  }
});

export default customAxios;