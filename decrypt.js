#!/usr/bin/env node
import readline from "readline";
import dotenvenc from "dotenvenc";


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("Make sure you have env.enc file before run this");

rl.stdoutMuted = true;
rl.query = "Env Password : ";
rl.question(rl.query, function(pass) {
  if (process.env.NODE_ENV == "stage") {
    dotenvenc.decrypt({passwd: pass, encryptedPathname: ".env.stage.enc", decryptedPathname: ".env.stage"});
  } else if (process.env.NODE_ENV == "prod") {
    dotenvenc.decrypt({passwd: pass, encryptedPathname: ".env.prod.enc", decryptedPathname: ".env.prod"});
  } else if (process.env.NODE_ENV == "prodfcom") {
    dotenvenc.decrypt({passwd: pass, encryptedPathname: ".env.prod-fcom.enc", decryptedPathname: ".env.prod-fcom"});
  } else if (process.env.NODE_ENV == "prodrobin") {
    dotenvenc.decrypt({passwd: pass, encryptedPathname: ".env.prodrobin.enc", decryptedPathname: ".env.prodrobin"});
  } else if (process.env.NODE_ENV == "prodbluesilo") {
    dotenvenc.decrypt({passwd: pass, encryptedPathname: ".env.prodbluesilo.enc", decryptedPathname: ".env.prodbluesilo"});
  } else if (process.env.NODE_ENV == "prodminto") {
    dotenvenc.decrypt({passwd: pass, encryptedPathname: ".env.prodminto.enc", decryptedPathname: ".env.prodminto"});
  } else {
    dotenvenc.decrypt({passwd: pass, encryptedPathname: ".env.enc", decryptedPathname: ".env"});
  }
  rl.close();
});

rl._writeToOutput = function _writeToOutput(stringToWrite) {
  if (rl.stdoutMuted)
    rl.output.write("\x1B[2K\x1B[200D"+rl.query+"");
  else
    rl.output.write(stringToWrite);
};

rl.on("close", () => {
  console.log("Success");
  process.exit(0);
})
