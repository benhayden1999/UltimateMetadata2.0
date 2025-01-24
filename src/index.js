import dotenv from "dotenv";
dotenv.config();
const TELEGRAM_KEY = process.env.TELEGRAM_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
import { Telegraf, Markup } from "telegraf";
import { message } from "telegraf/filters";
import { createClient } from "@supabase/supabase-js";

// File imports
import messages from "./utils/messages.js";
import { checkRegistration, registerUser, removeTrial } from "./services/supabase.js";
import { Invoice, subscriptionPaymentType, singlePaymentType } from "./services/telegram.js";
import { processDocument, validateFile } from "./services/processing.js";

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
  // Handle no subscription
  if (ctx.user.subscription_status === "none") {
    try {
      validateFile(ctx);
      console.log("no subscription");
      const subscriptionLink = await new Invoice(ctx, subscriptionPaymentType).createInvoiceLink();
      const singleLink = await new Invoice(ctx, singlePaymentType).createInvoiceLink();
      await ctx.reply(messages.pay, {
        parse_mode: "HTML",
        reply_to_message_id: ctx.message.message_id,
        ...Markup.inlineKeyboard([
          [Markup.button.url("Above file only -  20⭐️", singleLink)],
          [Markup.button.url("Unlimited files -  250✨/mo", subscriptionLink)],
        ]),
      });
      return;
    } catch (error) {
      ctx.reply(error.message);
      return;
    }
  }
  // Handle trial or subscription
  try {
    const newFilePath = await processDocument(ctx);
    ctx.reply(newFilePath); // <- test delete after
    // await replyWithNewDoc(ctx, newFilePath); <- PRODUCTION
  } catch (error) {
    await ctx.reply(error.message);
    return;
  }
  // Handle trial ending
  if (ctx.user.subscription_status === "trial") {
    await removeTrial(ctx);
    await ctx.reply(
      "See for yourself\n\n1. Save the photo to device and open it in gallery\n2. Look at photo info by tapping (i)\n3. See all the iPhone metadata added including location etc.\n\n*We add a LOT more info than you can see here, to see full extent go to exif.tool.",
      HTML
    );
    await ctx.reply(
      "<b>Platforms will promote your account to the set location, reduce ban risks, increase DM limits, avoid AI duplicate checks, and boost account trust giving it better privileges.</b>",
      HTML
    );
  }
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
