import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";

// config db
import { ConnectDB } from "./config/db.js";
// routes
import routes from "./src/routes/index.js";
// middleware
import { notFound, errorHandler } from "./src/middlewares/error.middleware.js";

dotenv.config();

const app = express();
// app.use(express.json());
const corsOptions = {
  origin: "*",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

ConnectDB(); //Set Connection with mongo db

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: "50mb"
  })
);

app.use(cors(corsOptions));
const PORT = process.env.PORT || 3000;

app.listen(
  PORT,
  console.log(`The server is listening on port ${PORT}`)
);

app.use("/", routes);

app.use(notFound);
app.use(errorHandler);