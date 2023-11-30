import dotenvenc from "dotenvenc";
if (process.env.NODE_ENV == "stage") {
  dotenvenc.decrypt({passwd: process.env.PASS, encryptedPathname: ".env.stage.enc", decryptedPathname: ".env.stage"});
} else if (process.env.NODE_ENV == "prod") {
  dotenvenc.decrypt({passwd: process.env.PASS, encryptedPathname: ".env.prod.enc", decryptedPathname: ".env.prod"});
} else if (process.env.NODE_ENV == "prodfcom") {
  dotenvenc.decrypt({passwd: process.env.PASS, encryptedPathname: ".env.prod-fcom.enc", decryptedPathname: ".env.prod-fcom"});
} else if (process.env.NODE_ENV == "prodrobin") {
  dotenvenc.decrypt({passwd: process.env.PASS, encryptedPathname: ".env.prodrobin.enc", decryptedPathname: ".env.prodrobin"});
} else if (process.env.NODE_ENV == "prodbluesilo") {
  dotenvenc.decrypt({passwd: process.env.PASS, encryptedPathname: ".env.prodbluesilo.enc", decryptedPathname: ".env.prodbluesilo"});
} else if (process.env.NODE_ENV == "prodminto") {
  dotenvenc.decrypt({passwd: process.env.PASS, encryptedPathname: ".env.prodminto.enc", decryptedPathname: ".env.prodminto"});
} else {
  dotenvenc.decrypt({passwd: process.env.PASS, encryptedPathname: ".env.enc", decryptedPathname: ".env"});
}