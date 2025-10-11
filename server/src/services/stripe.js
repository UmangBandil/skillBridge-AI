import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

export async function createConnectAccount(email) {
  return await stripe.accounts.create({ type: "express", email });
}

export async function createPaymentIntent(amount, currency, connectAccountId) {
  return await stripe.paymentIntents.create({
    amount,
    currency,
    payment_method_types: ["card"],
    application_fee_amount: Math.round(amount * 0.1), // 10 % platform fee
    transfer_data: { destination: connectAccountId },
  });
}