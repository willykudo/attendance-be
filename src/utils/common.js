
import _ from "lodash";
import cryptoJs from "crypto-js";

const cryptKey = "BlueSiloDevBE";

export const customizeError = (code, customMessage, errorData, additional) => {
	const messageIs = customMessage ? customMessage : errorData.message;
	let result = new Error(messageIs);

  if (code === undefined) {
    result.statusCode = errorData?.statusCode ? errorData?.statusCode : 500;
  } else {
    result.statusCode = code;
  }

	if (errorData?.stack !== undefined) {
    result.stack = errorData.stack;
  }

	if (errorData?.additional !== undefined) {
    result.additional = errorData.additional;
  } else if(additional !== undefined) {
    result.additional = additional;
  }
  if (errorData?.errors !== undefined) {
    result.errors = errorData.errors;
  }

	return result;
};

//Encrypting text
export const encryptString = (data) => {


	const encrypted = cryptoJs.AES.encrypt(data, cryptKey).toString();
	return encrypted;
}

// Decrypting text
export const decryptString = (data) => {
	const decrypted = cryptoJs.AES.decrypt(data, cryptKey).toString(cryptoJs.enc.Utf8);
	return decrypted;

}

export const generateRandomStr = (length) => {
	let result = '';
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const charactersLength = characters.length;

	for (let i = 0; i < length; i++ ) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}

	return result;
}