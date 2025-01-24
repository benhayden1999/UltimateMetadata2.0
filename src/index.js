import dotenv from "dotenv";
dotenv.config();
const TELEGRAM_KEY = process.env.TELEGRAM_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
import { Telegraf, Markup } from "telegraf";
import { message } from "telegraf/filters";
import { createClient } from "@supabase/supabase-js";
console.log(SUPABASE_KEY);
console.log(SUPABASE_URL);

// File imports
import messages from "./utils/messages.js";
import { checkRegistration, registerUser } from "./services/supabase.js";
const HTML = { parse_mode: "HTML" };

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const bot = new Telegraf(TELEGRAM_KEY);

bot.on(message("location"), async (ctx) => {
  console.log("location sent");
  console.log(ctx.message.location);
  try {
    const isRegistered = await registerUser(ctx);
    if (!isRegistered) {
      ctx.reply(messages.register, HTML);
      throw new Error("Error you could not be registered");
    }
    return ctx.reply("you're registered");
  } catch (error) {
    ctx.reply(error.message);
  }
});

// Middleware to check if user is registered and save user to ctx
bot.use(async (ctx, next) => {
  try {
    await checkRegistration(ctx);
    if (!ctx.user) return ctx.reply(messages.register, HTML);
    else await next();
  } catch (error) {
    console.log(error);
    await ctx.reply(error.message);
  }
});

bot.on(message("document"), async (ctx) => {
  console.log(ctx.message.document);
  const subscriptionStatus = getSubscriptionStatus(ctx);
  if (subscriptionStatus === "noSubscription") {
    await sendPaymentInvoice(ctx);
    return;
  }
  try {
    const newFilePath = await processDocument(ctx);
    await replyWithNewDoc(ctx, newFilePath);
  } catch (error) {
    ctx.reply(error.message);
  }

  const isSentSuccess = await processDocument(ctx);
});

bot.command("setlocation", async (ctx) => {
  ctx.reply(messages.setLocation, HTML);
});

// Local running -> Delete for lambda
bot.launch();
console.log("\x1b[1m\x1b[35m%s\x1b[0m", "Bot is launched");

// *-*-*-*-*-*-*-**-*-*-*-*-*-*-**-*-*-*-*-*-*-**-*-*-*-*-*-*-**-*-*-*-*-*-*-**-*-*-*-*-*-*-*

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
