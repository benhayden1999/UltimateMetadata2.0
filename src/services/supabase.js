import dotenv from "dotenv";
dotenv.config();
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const checkRegistration = async (ctx) => {
  const userId = ctx.from.id;
  const { data, error } = await supabase.from("users").select("*").eq("user_id", userId).single();

  if (error) {
    console.log("supabase error");
    throw new Error("Error checking your account status");
  } else if (error?.code === "PGRST116") {
    ctx.user = null;
  } else {
    createUserSubscriptionObject(ctx, data);
  }
  return ctx;
};

const registerUser = async (ctx) => {
  const userId = ctx.from.id;
  const gpsCoords = ctx.message.location;
  try {
    const { data, error } = await supabase
      .from("users")
      .upsert({ user_id: userId, gps_coords: gpsCoords }, { onConflict: ["user_id"] });
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error registering user:", error);
    return false;
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
const getSubscriptionStatus = ({ subscription_date_end, has_trial }) => {
  const isSubscriptionActive = subscription_date_end && new Date(subscription_date_end) > new Date();
  if (isSubscriptionActive) return "subscribed";
  if (has_trial) return "trial";
  return "none";
};

export { checkRegistration, registerUser };
