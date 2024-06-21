import nodemailer from "nodemailer";
import { SESClient } from "@aws-sdk/client-ses";
import path from "path";
import fs from "fs";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";

const ses = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const transporter = nodemailer.createTransport({
  SES: { ses, aws: SESClient },
});

// Based on AWS send limit email will be queued for x time until they can be sent and the queue will automatically be cleared out in a first come first server order.

const queueLimit = parseInt(process.env.AWS_SES_SEND_LIMIT_PER_SEC);
const waitLimit = parseInt(process.env.AWS_SES_QUEUE_WAIT_TIME);
let count = 0,
  sent = 0;

interface queueObj {
  [key: string]: unknown | any;
}
let queue: Array<any | { [key: string]: any | queueObj }> = [];
// const msgsSent = [];
let timeOutFunc: any = null;

class EmailEngine {
  static sendEmail = ({
    companyName,
    shortName,
    email,
    replyEmail,
    template,
    subject,
    data,
    push = true,
  }: {
    companyName: string;
    shortName: string;
    email: string;
    replyEmail: string;
    template: string;
    subject: string;
    data: Record<string, any>;
    push?: boolean;
  }) => {
    return new Promise(async (resolve, reject) => {
      try {
        const email_data = {
          companyName,
          shortName,
          email,
          replyEmail,
          template,
          subject,
          data,
          id: uuidv4(),
          send_count: 0,
        };
        console.log(email_data);

        // Check length of count which are emails being sent is at the send limit if so add email to queue or directly send email.
        if (count > queueLimit) {
          // Emails are added to a queue.
          console.log("Added to email queue.");
          queue.push(email_data);
        } else {
          count++;
          //////////////////////////////////////////////////////////////
          const response: any = await HelperFunctions.AWS_SEND(email_data);
          if (response.valid) {
            if (queue.length > 0) {
              // Removing email from queue if it is sent.
              queue = queue.filter((x) => x.id !== email_data.id);
            }
          } else {
            const indexToUpdate = queue.findIndex(
              (x) => x.id === email_data.id
            );
            queue[indexToUpdate]["send_count"]++;
            if (queue.length > 0) {
              if (queue[indexToUpdate]["send_count"] >= 3) {
                // Removing email from queue if it is sent.
                queue = queue.filter((x) => x.id !== email_data.id);
              }
            }
          }
          resolve(response);
          //////////////////////////////////////////////////////////////

          if (queue.length > 0 && sent == queueLimit) {
            // console.log("Emails waiting before send...");
            setTimeout(() => {
              sent = 0;
              count = 0;
              HelperFunctions.trigger();
            }, waitLimit);
          } else if (queue.length > 0 && queue.length < queueLimit) {
            // console.log("Cleaning up email queue.");
            timeOutFunc = setTimeout(() => {
              sent = 0;
              count = 0;
              HelperFunctions.trigger();
            }, 1000);
          }
        }
      } catch (error) {
        console.log({ error });
      }
    });
  };
}

class HelperFunctions {
  static AWS_SEND = async ({
    email, // person@gmail.com
    replyEmail, // hr@hiltonhavana.com
    subject, // THis is the subject of the email
    data, // Templated data for email which will replace template string.
    template, // the template name for the email
    id,
  }: {
    email: string;
    replyEmail: string;
    subject: string;
    data: Record<string, any>;
    template: string;
    id: string;
  }) => {
    return new Promise(async (resolve, reject) => {
      try {
        const htmlCode = fs
          .readFileSync(
            path.resolve(__dirname, "email_templates", `${template}.html`),
            "utf8"
          )
          .replace(/\n/g, "");

        const attachments: Array<any | { [key: string]: any | queueObj }> = [];
        // if (SEND_ATTACHMENTS) {
        //   if (MULTIPLE_FILES) {
        //     data.files.forEach((file, index) => {
        //       const theLocation = ["pdf"].includes(file.fileExtension)
        //         ? PDF_ATTACHMENTS_DIR
        //         : OTHER_ATTACHMENTS_DIR;
        //       var fileData = fs.readFileSync(
        //         path.resolve(__dirname, ...theLocation, file.fileName)
        //       );
        //       attachments.push({
        //         content: fileData,
        //         filename: `${file.emailFileName}.${file.fileExtension}`,
        //       });
        //     });
        //   } else {
        //     const theFileForUpload = `${data.fileName}.${FILE_EXTENSION}`;
        //     var fileData = fs.readFileSync(
        //       // Check where file to send is located
        //       path.resolve(
        //         __dirname,
        //         ...OTHER_ATTACHMENTS_DIR,
        //         theFileForUpload
        //       )
        //     );
        //     attachments.push({
        //       content: fileData,
        //       filename: `${data.name}.${FILE_EXTENSION}`,
        //     });
        //     //////////////////////////////
        //     //  var fileData = fs.readFileSync(
        //     //    // Check where file to send is located
        //     //    path.resolve(__dirname, ...OTHER_ATTACHMENTS_DIR, data.fileName)
        //     //  );
        //     //  attachments.push({
        //     //    content: fileData,
        //     //    filename: `${data.name}.${
        //     //      data.fileName.split(".")[data.fileName.split(".").length - 1]
        //     //    }`,
        //     //  });
        //   }
        // }

        let htmlString = htmlCode || "";

        const email_short_name = process.env.EMAIL_SHORT_NAME;

        for (const ele in data) {
          const searchString = "{{-" + ele + "-}}";
          const replacementString = data[ele] || "";
          const dynamicRegex = new RegExp(searchString, "g");
          htmlString = htmlString.replace(dynamicRegex, replacementString);
        }

        const searchString = "<a";
        const replacementString = `<a ses:tags="default:${email_short_name}-${Date.now()}" `;
        const dynamicRegex = new RegExp(searchString, "g");
        htmlString = htmlString.replace(dynamicRegex, replacementString);

        const params = {
          from: `${email_short_name} <${process.env.EMAIL_SENDING_ADDRESS}>`,
          to: email,
          subject: `${subject}`,
          text: `Email from - ${email_short_name}.`,
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
            resolve({ valid: false, err });
          } else {
            resolve({
              valid: true,
              dynamicDataListing,
              info: {
                envelope: info.envelope,
                response: info.response,
                messageId: info.messageId,
              },
            });
          }
        });
      } catch (err) {
        console.log({ err });
        resolve({ valid: false, data, err });
      }
    });
  };
  static trigger = async () => {
    timeOutFunc ? clearTimeout(timeOutFunc) : null;
    for (let i = 0; i < queueLimit; i++) {
      queue[0] ? EmailEngine.sendEmail(queue[0]) : null;
    }
  };
}

export default EmailEngine;
