import dotenv from "dotenv";
dotenv.config();
import axios from "axios";
import FormData from "form-data";
import fs from "fs";

const TELEGRAM_KEY = process.env.TELEGRAM_KEY;

const replyWithFile = async (ctx, newFileInfo) => {
  const { localFilePath } = newFileInfo;
  const form = new FormData();
  try {
    form.append("chat_id", ctx.chat.id);
    form.append("document", fs.createReadStream(localFilePath));
    //   form.append("reply_to_message_id", ctx.message.message_id.toString());
    //   form.append("caption", "<b>Nice iPhone 16Pro Photo brobro😉</b>");
    form.append("parse_mode", "HTML");

    const response = await axios.post(`https://api.telegram.org/bot${TELEGRAM_KEY}/sendDocument`, form, {
      headers: form.getHeaders(),
      timeout: 120000,
    });
    return response.data.result.message_id;

    // return response.data.result.message_id;
  } catch (error) {
    throw new Error("Error sending file");
  }
};

export { replyWithFile };
