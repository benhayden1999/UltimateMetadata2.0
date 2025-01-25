import fs from "fs";
import path from "path";
import axios from "axios";
import { modifyMetadata } from "./exif.js";

const processDocument = async (ctx) => {
  const fileInfo = await getfileInfo(ctx);
  try {
    const { file_url, file_size } = fileInfo;
    const localFilePath = await downloadFileToTemp(file_url);
    const metadata = await modifyMetadata(ctx, localFilePath, file_size);
    return { localFilePath, metadata };
  } catch (error) {
    throw new Error("Error processing file metadata");
  }
};

// Get telegram file URL
const getfileInfo = async (ctx) => {
  let file_id;
  if (ctx.message.successful_payment?.invoice_payload) {
    file_id = ctx.message.successful_payment.invoice_payload;
  } else if (ctx.message.document?.file_id) {
    file_id = ctx.message.document.file_id;
  } else throw new Error("Error getting file_id from message");
  try {
    const { href: file_url } = await ctx.telegram.getFileLink(file_id);
    const { file_size } = await ctx.telegram.getFile(file_id);
    const fileInfo = { file_url, file_size };
    return fileInfo;
  } catch (error) {
    throw new Error("Error getting file info (file_url, file_size)");
  }
};

// Download file to /tmp
const downloadFileToTemp = async (fileUrl) => {
  const fileName = path.basename(fileUrl);
  const localFilePath = path.join("/tmp", fileName);
  const response = await axios({
    method: "GET",
    url: fileUrl,
    responseType: "stream",
  });
  const writer = fs.createWriteStream(localFilePath);
  return new Promise((resolve, reject) => {
    response.data.pipe(writer);
    writer.on("finish", () => resolve(localFilePath));
    writer.on("error", (err) => reject(new Error("Error downloading file" + err.message)));
  });
};

//validate file size and type
const validateFile = (ctx) => {
  const { mime_type, file_size } = ctx.message.document;
  if (file_size > 9437184 || !mime_type.startsWith("image"))
    throw new Error("Sorry, either the file is not a photo or it's bigger than 9MB");
};

export { processDocument, validateFile };
