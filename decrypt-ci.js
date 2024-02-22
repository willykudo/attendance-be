import dotenvenc from "dotenvenc";
if (process.env.NODE_ENV == "stage") {
  dotenvenc.decrypt({passwd: process.env.PASS, encryptedPathname: ".env.stage.enc", decryptedPathname: ".env.stage"});
} else if (process.env.NODE_ENV == "prod") {
  dotenvenc.decrypt({passwd: process.env.PASS, encryptedPathname: ".env.prod.enc", decryptedPathname: ".env.prod"});
} else {
  dotenvenc.decrypt({passwd: process.env.PASS, encryptedPathname: ".env.enc", decryptedPathname: ".env"});
}