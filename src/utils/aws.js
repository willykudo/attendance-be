import fs from "fs";
import AWS from "aws-sdk";
import dotenv from "dotenv";
dotenv.config();

const s3 = new AWS.S3({
  region: "ap-southeast-1",
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

export const uploadFile = (file) => {
  const fileContent = fs.readFileSync(file[0].path);
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `${Date.now()}-${file[0].filename}`,
    Body: fileContent,
    ContentType: file[0].mimetype
  };

  return s3.upload(params).promise();
};

export const changePath = (image) => {

  if (!image || image == "")
    return "";

  if (image.includes("https://")) {
    return image;
  } else {
    return `https://${process.env.S3_BUCKET_NAME}.${process.env.AWS_IMAGE_URL}/${image}`;
  }
}