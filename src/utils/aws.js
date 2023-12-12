import AWS from "aws-sdk";
import dotenv from "dotenv";
import fs from "fs";
import multer from "multer";
dotenv.config();

const s3 = new AWS.S3({
  region: "ap-southeast-1",
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// export const uploadFile = (file) => {
//   const fileContent = fs.readFileSync(file[0].path);
//   const params = {
//     Bucket: process.env.S3_BUCKET_NAME,
//     Key: `uploads/${Date.now()}-${file[0].filename}`,
//     Body: fileContent,
//     ContentType: file[0].mimetype,
//   };

//   return s3.upload(params).promise();
// };

export const uploadFile = async (file) => {
  const fileStream = fs.createReadStream(file.path);

  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `uploads/${Date.now()}-${file.originalname}`,
    Body: fileStream,
    ContentType: file.mimetype,
  };

  const uploadToAWS = await s3.upload(params).promise();

  return uploadToAWS;
};

export const changePath = (image) => {
  if (!image || image == "") return "";

  if (image.includes("https://")) {
    return image;
  } else {
    return `https://${process.env.S3_BUCKET_NAME}.${process.env.AWS_IMAGE_URL}/${image}`;
  }
};

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const max_File = 1024 * 1024 * 1;

export const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.size > max_File) {
      // Return error if file size is more than 1MB
      return cb(new multer.MulterError("LIMIT_FILE_SIZE"), false);
    }

    // Validasi ekstensi file
    const allowedExtensions = ["jpg", "jpeg", "png"];

    if (!allowedExtensions.includes(file.originalname.split(".")[1])) {
      return cb(new multer.MulterError("INVALID_EXTENSION"), false);
    }

    cb(null, true);
  },
});
