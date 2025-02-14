import mongoose from "mongoose";

const ConnectDB = () => {
  console.log("Connecting to MongoDB...");
  mongoose.set("strictQuery", false);

  const conn = mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
      console.log(`Connectedf to MongoDB ${process.env.MONGO_URL}`);
    })
    .catch((err) => {
      console.log(`Error connecting to MongoDB ${err.message}`);
    });
};

const CloseDB = () => {
  mongoose.connection.close();
};

export { ConnectDB, CloseDB };
