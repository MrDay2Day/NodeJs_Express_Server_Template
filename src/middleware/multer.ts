import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

// Params for multer middleware
const storage = multer.memoryStorage();
const limits = {
  fileSize: 100000000, // 100MB
};

const imageFileTypes = (req: any, file: any, callback: any) => {
  try {
    const fileFormat = ["image/jpeg", "image/png", "image/jpg"];
    if (fileFormat.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(null, false);
      callback(
        new Error("Please ensure you are uploading 1 image (jpeg or png).")
      );
    }
  } catch (error) {
    callback(
      new Error("Something went wrong processing this file. Code: FL000001")
    );
  }
};

const documentFileType = (req: any, file: any, callback: any) => {
  try {
    const fileFormat = [
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
    if (fileFormat.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(null, false);
      callback(
        new Error("Please ensure you are uploading 1 image (jpeg or png).")
      );
    }
  } catch (error) {
    callback(
      new Error("Something went wrong processing this file. Code: FL000002")
    );
  }
};

const jsonFileType = (req: any, file: any, callback: any) => {
  try {
    const fileFormat = ["application/json"];
    if (fileFormat.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(null, false);
      callback(new Error("Please ensure you are uploading 1 JSON file."));
    }
  } catch (error) {
    callback(
      new Error("Something went wrong processing this file. Code: FL000003")
    );
  }
};

const excelOnly = (req: any, file: any, callback: any) => {
  try {
    const fileFormat = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.ms-excel.addin.macroEnabled.12",
      "application/vnd.ms-excel.sheet.macroEnabled.12",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (fileFormat.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(null, false);
      callback(
        new Error("Please ensure you are uploading 1 image (jpeg or png).")
      );
    }
  } catch (error) {
    callback(
      new Error("Something went wrong processing this file. Code: FL000004")
    );
  }
};

// Multer Middleware
export const multer_text = multer({
  limits,
  storage,
}).none();

export const multer_any = multer({
  limits,
  storage,
}).any();

export const multer_single_image = multer({
  limits,
  storage,
  fileFilter: imageFileTypes,
}).single("singleImage");

export const multer_multi_image = multer({
  limits,
  storage,
  fileFilter: imageFileTypes,
}).fields([{ name: "multiImage", maxCount: 20 }]);

export const multer_multi_file = multer({
  limits,
  storage,
  fileFilter: documentFileType,
}).fields([{ name: "multiDocuments", maxCount: 10 }]);

export const multer_single_files = multer({
  limits,
  storage,
  fileFilter: documentFileType,
}).single("singleDocument");

export const multer_json_files = multer({
  limits,
  storage,
  fileFilter: jsonFileType,
}).fields([{ name: "jsonFile", maxCount: 1 }]);

export const multer_excel = multer({
  limits,
  storage,
  fileFilter: excelOnly,
}).single("excel");
