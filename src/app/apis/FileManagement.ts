import crypto from "crypto";

import sharp from "sharp";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

// @ts-ignore
import imagemin from "imagemin";
// @ts-ignore
import imageminJpegtran from "imagemin-jpegtran";
// @ts-ignore
import imageminPngquant from "imagemin-pngquant";

import sizeOf from "buffer-image-size";

import B2 from "backblaze-b2";
import { NextFunction, Request, Response } from "express";

const fileTypes = ["profileImage", "document", "image"];
const imagesOnly = ["profileImage", "image"];

async function WriteFileToDB({}) {
  return {};
}

async function DeleteFileToDB({}) {
  return {};
}

const b2_private = {
  applicationKeyId: process.env.BACKBLAZE_PRIVATE_KEY_ID,
  applicationKey: process.env.BACKBLAZE_PRIVATE_KEY,
};
const b2 = new B2(b2_private);

var encodedBase64_private = Buffer.from(
  b2_private.applicationKeyId + ":" + b2_private.applicationKey
).toString("base64");
// console.log({ b2_private, encodedBase64_private });
async function GetBucket() {
  try {
    await b2.authorize(); // must authorize first (authorization lasts 24 hrs)
    let response = await b2.getBucket({
      bucketName: process.env.BACKBLAZE_PRIVATE_BUCKET_NAME,
    });
  } catch (err) {
    console.log("S3 Storage Error", err);
  }
}
GetBucket();

/**
 *
 * Refactor code for document such as .doc .pdf .xlsx etc and choose their respective folders.
 */

class Worker {
  static resizeImage = async (file: any, size: any) => {
    return new Promise((resolve, reject) => {
      const dimensions = sizeOf(file);
      let height = null,
        width = null;

      if (dimensions.height > size || dimensions.width > size) {
        if (dimensions.height > dimensions.width) {
          height = size;
        } else {
          width = size;
        }
      } else {
        height = dimensions.height;
        width = dimensions.width;
      }

      sharp(file, { failOnError: false })
        .resize(width, height, {
          // width: size,
          // height: size,
          // failOnError: false,
          fit: "contain",
          position: "centre",
          kernel: sharp.kernel.mitchell,
          withoutEnlargement: false,
          // background: { r: 255, g: 255, b: 255, alpha: 0 },
        })
        .toBuffer()
        .then(async (buffer: any) => {
          const file = await imagemin.buffer(buffer, {
            plugins: [
              imageminJpegtran({
                progressive: true,
              }),
              imageminPngquant({
                dithering: false,
                speed: 1,
                quality: [0.8, 0.8],
              }),
            ],
          });
          resolve(file);
        })
        .catch((err: any) => {
          console.log("SHARP ERR", { err });
          reject(err);
        });
    });
  };

  static uploadNow = async (
    uploadUrl: any,
    uploadAuthorizationToken: any,
    image: any,
    location: any,
    file: any,
    fileName: string
  ) => {
    try {
      const filePath = `${location}/${fileName}.${file.mimetype.split("/")[1]}`;
      var Sha1 = crypto.createHash("sha1").update(image).digest("hex");
      // console.log("UPLOAD", {
      //   uploadUrl,
      //   uploadAuthorizationToken,
      //   image,
      //   location,
      //   file,
      //   fileName,
      //   filePath,
      //   Sha1,
      // });
      const upload = await b2.uploadFile({
        uploadUrl,
        uploadAuthToken: uploadAuthorizationToken,
        fileName: filePath,
        contentLength: file.size + 40,
        mime: file.mimetype,
        data: image,
        hash: Sha1,
        onUploadProgress: (event: any) => {},
      });
      return upload.data;
    } catch (err) {
      throw err;
    }
  };

  static backblazeUpload = async (file: any, type: string, userId: string) => {
    // return;
    try {
      const response = await b2.authorize();

      // console.log({ response });

      const data = response.data;

      const uploadRequest = await b2.getUploadUrl({
        bucketId: data.allowed.bucketId,
      });

      console.log({ data, uploadRequest: uploadRequest.data });

      var uploadUrl = uploadRequest.data.uploadUrl;
      var uploadAuthorizationToken = uploadRequest.data.authorizationToken;
      var fileName = `${uuidv4()}-${Date.now()}`;
      var source = file.buffer;

      var location, resizedImage;

      if (!fileTypes.includes(type)) {
        throw { msg: "Invalid Request" };
      } else {
        location = type;
      }

      if (imagesOnly.includes(type)) {
        resizedImage = await this.resizeImage(source, 800);
      }

      let uploadRegularData = {};
      let uploadThumbnailData = {};

      uploadRegularData = await this.uploadNow(
        uploadUrl,
        uploadAuthorizationToken,
        imagesOnly.includes(type) ? resizedImage : source,
        location,
        file,
        fileName
      );

      if (imagesOnly.includes(type)) {
        const thumbnail = await this.resizeImage(source, 200);
        uploadThumbnailData = await this.uploadNow(
          uploadUrl,
          uploadAuthorizationToken,
          thumbnail,
          `${type}/thumbnail`,
          file,
          fileName
        );
      }

      const uploadedFile =
        fileName.split("/")[fileName.split("/").length - 1] +
        "." +
        file.mimetype.split("/")[1];

      return {
        fileName: uploadedFile,
        userId,
        type,
        uploadRegularData,
        uploadThumbnailData,
      };
    } catch (err) {
      console.log({ err });
      throw err;
    }
  };
  /**
   *
   * DELETE FILE
   *
   */

  static backblazeDelete = async (
    fileName: string,
    fileId: string,
    type: string
  ) => {
    // return;
    try {
      const deleteRequest = await b2.deleteFileVersion({
        fileId,
        fileName,
      });

      console.log({ deleteRequest: deleteRequest.data });

      return { deleteRequest: deleteRequest.data };
    } catch (err) {
      console.log({ err });
      throw err;
    }
  };
}

class FileManagement {
  static upload = async (type: string, userId: string, file: any) => {
    type backUpInfo = null | { [key: string]: string | number };
    var backUpInfo = {};
    try {
      if (!fileTypes.includes(type)) {
        throw { msg: "Invalid entry for file." };
      }

      console.log({ file });

      const fileData = await Worker.backblazeUpload(file, type, userId);

      backUpInfo = fileData;

      const savedFile = await WriteFileToDB({
        ...fileData,
        type,
        _id: uuidv4() + "-" + Date.now(),
      });

      return savedFile;
    } catch (err) {
      console.log({ backUpInfo });
      this.delete(backUpInfo);
      console.log({ err });
      throw { err };
    }
  };

  static delete = async (fileData: null | { [key: string]: any }) => {
    try {
      const result = [];

      console.log({ fileData });

      if (fileData) {
        if (fileData.uploadRegularData) {
          const res_regular = await Worker.backblazeDelete(
            fileData.uploadRegularData.fileName,
            fileData.uploadRegularData.fileId,
            fileData.type
          );
          result.push({ regular: res_regular });
        }

        if (fileData.uploadThumbnailData) {
          const res_thumbnail = await Worker.backblazeDelete(
            fileData.uploadThumbnailData.fileName,
            fileData.uploadThumbnailData.fileId,
            fileData.type
          );
          result.push({ thumbnail: res_thumbnail });
        }
      }

      console.log({ result });

      return result;
    } catch (err) {
      console.log({ err });
      throw { err };
    }
  };

  static findAndDelete = async (fileName: string) => {
    try {
      let fileData = await DeleteFileToDB(fileName);

      const result = await this.delete(fileData);

      console.log({ deletedFileData: result });

      return result;
    } catch (err) {
      console.log({ err });
      return { err };
    }
  };
}

export async function fetchFile(
  req: Request & { fileInfo: any },
  res: Response,
  next: NextFunction
) {
  try {
    const { fileName, type } = req.params;
    console.log({ fileName, type });

    if (!!process.env.FILE_UP_DOWN) {
      throw { msg: "File fetch disabled.", code: "BB0000001" };
    }
    const { fileInfo } = req;

    var fileToSend: any;
    // console.log(fileInfo);
    if (!fileInfo) {
      throw { msg: "File not found", code: "BB0000002" };
    } else if (type == "thumbnail") {
      fileToSend = await b2.downloadFileByName({
        bucketName: process.env.BACKBLAZE_PRIVATE_BUCKET_NAME,
        fileName: fileInfo.uploadThumbnailData.fileName,
        // options are as in axios: 'arraybuffer', 'blob', 'document', 'json', 'text', 'stream'
        responseType: "arraybuffer",
      });
      res.setHeader("Content-Type", fileInfo.uploadThumbnailData.contentType);
    } else if (type == "full") {
      fileToSend = await b2.downloadFileByName({
        bucketName: process.env.BACKBLAZE_PRIVATE_BUCKET_NAME,
        fileName: fileInfo.uploadRegularData.fileName,
        // options are as in axios: 'arraybuffer', 'blob', 'document', 'json', 'text', 'stream'
        responseType: "arraybuffer",
      });
      res.setHeader("Content-Type", fileInfo.uploadRegularData.contentType);
    }

    res.send(fileToSend.data);
  } catch (err: any | unknown) {
    console.log({ err });
    res.statusCode = 400;
    res.json({
      valid: false,
      err: {
        msg: err.msg || "Something went wrong, please try again.",
        Code: err.code || "BB0000003",
      },
    });
  }
}

export default FileManagement;
