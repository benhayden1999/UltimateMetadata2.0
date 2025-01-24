import { configDotenv } from "dotenv";
configDotenv();
const SUBSCRIPTION_PRICE = process.env.SUBSCRIPTION_PRICE;
const INDIVIDUAL_PRICE = process.env.INDIVIDUAL_PRICE;

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

const singlePaymentType = {
  title: "Single Request",
  description: "Single Payment",
  price: INDIVIDUAL_PRICE,
  subscription: false,
};

const subscriptionPaymentType = {
  title: "1 Month Unlimited",
  description: "Subscription",
  price: SUBSCRIPTION_PRICE,
  subscription: true,
};

export { Invoice, singlePaymentType, subscriptionPaymentType };
