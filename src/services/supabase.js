import dotenv from "dotenv";
dotenv.config();
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const checkRegistration = async (ctx) => {
  const userId = ctx.from.id;
  const { data, error } = await supabase.from("users").select("*").eq("user_id", userId).single();
  if (error?.code === "PGRST116") {
    ctx.user = null;
  } else if (error?.code === "PGRST116") {
    throw new Error("Error checking your account status");
  } else {
    createUserSubscriptionObject(ctx, data);
  }
  return ctx;
};

const registerUser = async (ctx) => {
  const userId = ctx.from.id;
  const gpsCoords = ctx.message.location;
  const { data, error } = await supabase
    .from("users")
    .upsert({ user_id: userId, gps_coords: gpsCoords }, { onConflict: ["user_id"] });
  if (error) throw new Error("Error registering user");
};

const removeTrial = async (ctx) => {
  const userId = ctx.from.id;
  const { data, error } = await supabase.from("users").update({ has_trial: false }).eq("user_id", userId);
};

const addSubscription = async (ctx) => {
  const userId = ctx.from.id;
  const subscriptionEndDate = ctx.message.successful_payment.subscription_expiration_date;
  const { data, error } = await supabase
    .from("users")
    .update({ subscription_end_date: subscriptionEndDate })
    .eq("user_id", userId);
  if (error) {
    throw new Error("Error adding subscription");
  }
};

// Helper function to create ctx.user object
const createUserSubscriptionObject = (ctx, data) => {
  ctx.user = {
    user_id: data.user_id,
    gpsCoords: data.gps_coords,
    subscription_status: getSubscriptionStatus(data),
  };
  return ctx;
};

// Helper function to determine subscription status
const getSubscriptionStatus = ({ subscription_end_date, has_trial }) => {
  const now = Math.floor(Date.now() / 1000);
  const isSubscriptionActive = subscription_end_date && subscription_end_date > now;
  if (isSubscriptionActive) return "subscribed";
  if (has_trial) return "trial";
  return "none";
};

export { checkRegistration, registerUser, removeTrial, addSubscription };
