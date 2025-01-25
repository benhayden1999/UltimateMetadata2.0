import { configDotenv } from "dotenv";
configDotenv();
const SUBSCRIPTION_PRICE = process.env.SUBSCRIPTION_PRICE;
const INDIVIDUAL_PRICE = process.env.INDIVIDUAL_PRICE;

import { Markup } from "telegraf";
import messages from "../utils/messages.js";

class Invoice {
  constructor(ctx, invoiceType) {
    this.ctx = ctx;
    this.invoiceType = invoiceType;
  }

  createParams() {
    const invoiceParams = {
      title: this.invoiceType.title,
      description: this.invoiceType.description,
      payload: this.ctx.message.document.file_id,
      provider_token: "",
      currency: "XTR",
      prices: [{ amount: this.invoiceType.price, label: this.invoiceType.description }],
    };
    if (this.invoiceType.subscription) {
      invoiceParams.subscription_period = 2592000;
    }
    return invoiceParams;
  }

  async createInvoiceLink() {
    const invoiceParams = this.createParams();
    const invoiceLink = await this.ctx.telegram.createInvoiceLink(invoiceParams);
    return invoiceLink;
  }
}

const handleNoSubscription = async (ctx) => {
  try {
    const subscriptionLink = await new Invoice(ctx, subscriptionPaymentType).createInvoiceLink();
    const singleLink = await new Invoice(ctx, singlePaymentType).createInvoiceLink();
    await ctx.reply(messages.pay, {
      parse_mode: "HTML",
      reply_to_message_id: ctx.message.message_id,
      ...Markup.inlineKeyboard([
        [Markup.button.url(`This file only ~ ${INDIVIDUAL_PRICE}stars`, singleLink)],
        [Markup.button.url(`✨Unlimited files ~ ${SUBSCRIPTION_PRICE}stars/mo✨`, subscriptionLink)],
      ]),
    });
  } catch (error) {
    throw new Error("Error creating invoice links");
  }
};

const refundPayment = async (ctx) =>
  await ctx.telegram.callApi("refundStarPayment", {
    user_id: ctx.from.id,
    telegram_payment_charge_id: ctx.message.successful_payment.telegram_payment_charge_id,
  });

// Helper within the class
const singlePaymentType = {
  title: "Single Request",
  description: "Single Payment",
  price: INDIVIDUAL_PRICE,
  subscription: false,
};

// Helper within the class
const subscriptionPaymentType = {
  title: "1 Month Unlimited",
  description: "Subscription",
  price: SUBSCRIPTION_PRICE,
  subscription: true,
};

export { Invoice, handleNoSubscription, refundPayment };
