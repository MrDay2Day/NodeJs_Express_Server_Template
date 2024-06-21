import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

// Params for multer middleware
const storage = multer.memoryStorage();

const imageFileTypes = (req: any, file: any, callback: any) => {
  try {
    const imgFormat = ["image/jpeg", "image/png", "image/jpg"];
    if (imgFormat.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(null, false);
      callback(
        new Error("Please ensure you are uploading 1 image (jpeg or png).")
      );
    }
  } catch (error) {
    callback(
      new Error("Something went wrong processing this file. Code: X00132")
    );
  }
};

const documentFileType = (req: any, file: any, callback: any) => {
  try {
    const imgFormat = [
      "text/csv",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.ms-excel.addin.macroEnabled.12",
      "application/vnd.ms-excel.sheet.macroEnabled.12",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/pdf",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.ms-access",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];
    if (imgFormat.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(null, false);
      callback(
        new Error("Please ensure you are uploading 1 image (jpeg or png).")
      );
    }
  } catch (error) {
    callback(
      new Error("Something went wrong processing this file. Code: X00132")
    );
  }
};

const jsonFileType = (req: any, file: any, callback: any) => {
  try {
    const imgFormat = ["application/json"];
    if (imgFormat.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(null, false);
      callback(
        new Error("Please ensure you are uploading 1 image (jpeg or png).")
      );
    }
  } catch (error) {
    callback(
      new Error("Something went wrong processing this file. Code: X00132")
    );
  }
};

const excelOnly = (req: any, file: any, callback: any) => {
  try {
    const imgFormat = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.ms-excel.addin.macroEnabled.12",
      "application/vnd.ms-excel.sheet.macroEnabled.12",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (imgFormat.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(null, false);
      callback(
        new Error("Please ensure you are uploading 1 image (jpeg or png).")
      );
    }
  } catch (error) {
    callback(
      new Error("Something went wrong processing this file. Code: X00132")
    );
  }
};

// Multer Middleware
export const multer_passthrough = multer({
  storage,
}).any();

export const multer_image_single = multer({
  storage,
  fileFilter: imageFileTypes,
}).array("singleImage", 1);

export const multer_multi_single = multer({
  storage,
  fileFilter: imageFileTypes,
}).array("multiImage", 20);

export const multer_multi_file = multer({
  storage,
  fileFilter: documentFileType,
}).array("multiDocuments", 10);

export const multer_single_files = multer({
  storage,
  fileFilter: documentFileType,
}).array("singleDocument", 1);

export const json_files = multer({
  storage,
  fileFilter: jsonFileType,
}).array("jsonFile", 1);

export const multer_sheets = multer({
  storage,
  fileFilter: excelOnly,
}).array("sheets", 1);
