import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const mockData = async () => {
  const { MOCKDATA_API } = process.env;

  if (!MOCKDATA_API) {
    throw new Error("MOCKDATA_API is not defined");
  }

  try {
    const response = await axios.get(MOCKDATA_API);

    const data = response.data;

    return data;
  } catch (error) {
    console.error("Error fetching data:", error.message);
    throw error;
  }
};

export default mockData;
