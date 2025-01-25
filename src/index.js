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
import { checkRegistration, registerUser, removeTrial, addSubscription } from "./services/supabase.js";
import { handleNoSubscription, refundPayment } from "./services/telegram.js";
import { processDocument, validateFile } from "./services/processing.js";
import { replyWithFile } from "./services/axios.js";
import { createMetadataMessage, HTML } from "./utils/helper.js";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const bot = new Telegraf(TELEGRAM_KEY);

bot.command("setlocation", async (ctx) => {
  ctx.reply(messages.setLocation, HTML);
  ctx.deleteMessage(ctx.message.message_id);
  return;
});

bot.command("start", async (ctx) => {
  console.log(ctx.message);
  ctx.reply(messages.start, HTML);
  ctx.deleteMessage(ctx.message.message_id);
  return;
});

bot.command("info", async (ctx) => {
  console.log(ctx.message);
  ctx.reply(messages.start, HTML);
  ctx.deleteMessage(ctx.message.message_id);
  return;
});

bot.command("affiliate", async (ctx) => {
  ctx.reply(messages.affiliate, HTML);
  ctx.deleteMessage(ctx.message.message_id);
  return;
});

bot.command("fragment", async (ctx) => {
  await ctx.reply(messages.fragment, {
    parse_mode: "HTML",
    disable_web_page_preview: true,
  });
  ctx.deleteMessage(ctx.message.message_id);
  return;
});

bot.command("report", async (ctx) => {
  ctx.reply(messages.report, HTML);
  ctx.deleteMessage(ctx.message.message_id);
  return;
});

bot.on([message("photo"), message("video")], async (ctx) => {
  ctx.reply(messages.notSupported, HTML);
  ctx.deleteMessage(ctx.message.message_id);
  return;
});

bot.on(message("location"), async (ctx) => {
  try {
    await registerUser(ctx);
    await ctx
      .reply(messages.registerSuccess, {
        reply_to_message_id: ctx.message.message_id,
        parse_mode: "HTML",
      })
      .then((msg) => {
        ctx.telegram.unpinAllChatMessages(ctx.chat.id);
        ctx.telegram.pinChatMessage(ctx.chat.id, msg.message_id);
      });
    return;
  } catch (error) {
    ctx.reply(error.message);
  }
});

bot.on(message("text"), async (ctx) => {
  ctx.reply("Please send an image as a file and we'll do the rest.");
  ctx.deleteMessage(ctx.message.message_id);
  return;
});

// Check user and add ctx.user
bot.use(async (ctx, next) => {
  console.log("middleware");
  if (ctx.message?.from.is_bot) return;
  try {
    await checkRegistration(ctx);
    if (!ctx.user) return ctx.reply(messages.register, HTML);
    else await next();
  } catch (error) {
    await ctx.reply(error.message);
  }
});

bot.on(message("document"), async (ctx) => {
  try {
    await validateFile(ctx);
    // Handle no subscription
    if (ctx.user.subscription_status === "none") {
      await handleNoSubscription(ctx);
      return;
    }
    // Handle trial or subscription
    ctx.telegram.sendChatAction(ctx.chat.id, "upload_document");
    const newFileInfo = await processDocument(ctx);
    const docSentMessageId = await replyWithFile(ctx, newFileInfo);
    const metadataMessage = createMetadataMessage(newFileInfo.metadata);
    await ctx.reply(metadataMessage, {
      reply_to_message_id: docSentMessageId,
      parse_mode: "HTML",
    });
    ctx.deleteMessage(ctx.message.message_id);
    // Handle trial ending
    if (ctx.user.subscription_status === "trial") {
      await removeTrial(ctx);
      await ctx.reply(messages.postTrialPitch, HTML);
    }
  } catch (error) {
    console.log(error);
    await ctx.reply(error.message);
    return;
  }
});

bot.on("pre_checkout_query", async (ctx) => {
  await ctx.answerPreCheckoutQuery(true);
});

bot.on(message("successful_payment"), async (ctx) => {
  console.log(ctx);
  const paymentInfo = ctx.message.successful_payment;
  try {
    if (paymentInfo?.is_recurring) {
      await addSubscription(ctx);
      return ctx.reply(messages.subscriptionSuccess, HTML);
    }
    ctx.telegram.sendChatAction(ctx.chat.id, "upload_document");
    const newFileInfo = await processDocument(ctx);
    const docSentMessageId = await replyWithFile(ctx, newFileInfo); // <- PRODUCTION
    const metadataMessage = createMetadataMessage(newFileInfo.metadata);
    await ctx.reply(metadataMessage, {
      reply_to_message_id: docSentMessageId,
      parse_mode: "HTML",
    });
  } catch (error) {
    await ctx.reply(error.message);
    await refundPayment(ctx);
  }
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
