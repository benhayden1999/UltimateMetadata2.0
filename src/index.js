import dotenv from "dotenv";
dotenv.config();
const TELEGRAM_KEY = process.env.TELEGRAM_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
import { Telegraf, Markup } from "telegraf";
import { message } from "telegraf/filters";
import { createClient } from "@supabase/supabase-js";
import messages from "./utils/messages.js";
const HTML = { parse_mode: "HTML" };

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const bot = new Telegraf(TELEGRAM_KEY);

bot.on(message("text"), async (ctx) => {
  ctx.reply(messages.start, HTML);
});

// Local running -> Delete for lambda
bot.launch();
console.log("\x1b[1m\x1b[35m%s\x1b[0m", "Bot is launched");

// Lambda stuff
// const handleUpdate = async (body) => {
//   console.log("index is running");
//   try {
//     await bot.handleUpdate(body);
//   } catch (error) {
//     console.log(error);
//     throw new Error("Bot logic error:", error);
//   }
// };

// export { handleUpdate };
