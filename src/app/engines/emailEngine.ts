import nodemailer from "nodemailer";
import * as aws from "@aws-sdk/client-ses";
import path from "path";
import fs from "fs";

const ses = new aws.SES({
  region: process.env.AWS_REGION ? process.env.AWS_REGION : "",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID
      ? process.env.AWS_ACCESS_KEY_ID
      : "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      ? process.env.AWS_SECRET_ACCESS_KEY
      : "",
  },
});

const transporter = nodemailer.createTransport({
  SES: { ses, aws },
});

export type AttachmentType = {
  buffer: Buffer;
  mimetype: string;
  extension: string;
  fileName: string;
};

export type AWSEmailType = {
  id: string;
  email: string;
  replyEmail: string;
  sendEmail: string;
  shortName: string;
  subject: string;
  text?: string;
  data: Record<string, any>;
  emailAttachments?: AttachmentType[];
  template: string;
};

/**
 * @typedef {Object} AttachmentType
 * @property {Buffer} buffer - The file content in buffer format.
 * @property {string} mimetype - The MIME type of the attachment.
 * @property {string} extension - The file extension of the attachment.
 * @property {string} fileName - The name of the attachment file without extension.
 */

/**
 * @typedef {Object} AWSEmailType
 * @property {string} id - The unique identifier for the email.
 * @property {string} email - The recipient's email address.
 * @property {string} replyEmail - The email address to reply to.
 * @property {string} sendEmail - The sender's email address.
 * @property {string} shortName - A short identifier for the sender.
 * @property {string} subject - The subject of the email.
 * @property {string} text - The email text if no template is provided.
 * @property {Object<string, any>} data - The dynamic data to inject into the email template.
 * @property {AttachmentType[]} emailAttachments - Array of attachments for the email.
 * @property {string} template - The name of the email template to use.
 */

/**
 * EmailEngine class to send emails using AWS SES with dynamic templates.
 */
class EmailEngine {
  /**
   * Sends an email using AWS SES.
   *
   * @async
   * @function AWS_SEND
   * @memberof EmailEngine
   * @param {AWSEmailType} emailDetails - The email details including recipient, sender, subject, etc.
   * @returns {Promise<Object>} Resolves with an object containing `valid: Boolean` and any additional info or error.
   *
   * @example
   * const result = await EmailEngine.AWS_SEND({
   *   id: "12345",
   *   email: "recipient@example.com",
   *   replyEmail: "noreply@example.com",
   *   sendEmail: "sender@example.com",
   *   shortName: "CompanyName",
   *   subject: "Welcome to our service",
   *   data: { firstName: "John", lastName: "Doe" },
   *   emailAttachments: [
   *     {
   *       buffer: fileBuffer,
   *       mimetype: "application/pdf",
   *       extension: "pdf",
   *       fileName: "document"
   *     }
   *   ],
   *   template: "welcome"
   * });
   */
  static AWS_SEND = async ({
    email,
    replyEmail,
    sendEmail,
    shortName,
    subject,
    data,
    text,
    emailAttachments,
    template,
    id,
  }: AWSEmailType): Promise<{ valid: Boolean; [key: string]: any }> => {
    return new Promise(async (resolve, reject) => {
      try {
        let htmlCode = "";

        if (template) {
          try {
            htmlCode = fs
              .readFileSync(
                path.resolve(__dirname, "email_templates", `${template}.html`),
                "utf8"
              )
              .replace(/\n/g, "");
          } catch (html_error) {
            console.log({ html_error });
          }
        }

        const attachments: Array<any | { [key: string]: any }> = [];
        if (emailAttachments?.length) {
          emailAttachments.forEach((attachment) => {
            attachments.push({
              content: attachment.buffer,
              filename: `${attachment.fileName?.split(".")[0]}.${
                attachment.extension
              }`,
            });
          });
        }

        let htmlString = htmlCode || text || "";

        for (const ele in data) {
          const searchString = "{{-" + ele + "-}}";
          const replacementString = data[ele] || "";
          const dynamicRegex = new RegExp(searchString, "g");
          htmlString = htmlString.replace(dynamicRegex, replacementString);
        }

        const searchString = "<a";
        const replacementString = `<a ses:tags="default:${shortName}-${Date.now()}" `;
        const dynamicRegex = new RegExp(searchString, "g");
        htmlString = htmlString.replace(dynamicRegex, replacementString);

        const params = {
          from: `${shortName} <${sendEmail}>`,
          to: email,
          subject: `${subject}`,
          text: text,
          replyTo: replyEmail,
          attachments,
          html: htmlString,
        };

        const dynamicDataListing: Record<string, any> = {};

        for (const ele in data) {
          if (params.html.includes(data[ele])) {
            dynamicDataListing[ele] = true;
          } else {
            dynamicDataListing[ele] = false;
          }
        }

        transporter.sendMail(params, (err: any, info: any) => {
          if (err) {
            reject({ valid: false, data, err });
          } else {
            resolve({
              valid: true,
              dynamicDataListing,
              data: {
                email,
                replyEmail,
                sendEmail,
                shortName,
                subject,
                data,
                text,
                emailAttachments,
                template,
                id,
              },
              info: {
                envelope: info.envelope,
                response: info.response,
                messageId: info.messageId,
              },
            });
          }
        });
      } catch (err) {
        reject({ valid: false, data, err });
      }
    });
  };
}

export default EmailEngine;
