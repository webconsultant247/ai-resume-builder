import { env } from "@/env";
import prisma from "@/lib/prisma";
import stripe from "@/lib/stripe";
import { clerkClient } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import Stripe from "stripe";

export const POST = async (req: NextRequest) => {
  try {
    const payload = await req.text();

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response("Invalid signature", { status: 400 });
    }

    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );

    console.log(`Received event: ${event.type}`, event.data.object);

    switch (event.type) {
      case "checkout.session.completed":
        await handleSessionCompleted(event.data.object);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionCreatedOrUpdated(event.data.object.id);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }

  return new Response("Event Received", { status: 200 });
};

const handleSessionCompleted = async (session: Stripe.Checkout.Session) => {
  const userId = session.metadata?.userId;

  if (!userId) {
    throw new Error("User ID not found in session metadata");
  }

  (await clerkClient()).users.updateUserMetadata(userId, {
    privateMetadata: {
      stripeCustomerId: session.customer as string,
    },
  });

  console.log("handleSessionCompleted", session);
};

const handleSubscriptionCreatedOrUpdated = async (subscriptionId: string) => {
  //   console.log("handleSubscriptionCreatedOrUpdated", subscriptionId);

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  if (
    subscription.status === "active" ||
    subscription.status === "trialing" ||
    subscription.status === "past_due"
  ) {
    await prisma.userSubscription.upsert({
      where: {
        userId: subscription.metadata?.userId as string,
      },
      create: {
        userId: subscription.metadata.userId,
        stripeSubscriptionId: subscriptionId,
        stripeCustomerId: subscription.customer as string,
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(
          subscription.current_period_end * 1000
        ),
        stripeCancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
      update: {
        stripePriceId: subscription.items.data[0].price.id,

        stripeCurrentPeriodEnd: new Date(
          subscription.current_period_end * 1000
        ),
        stripeCancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
    });
    // const userId = subscription.metadata?.userId;
    // if (!userId) {
    //   throw new Error("User ID not found in subscription metadata");
    // }
    // (await clerkClient()).users.updateUserMetadata(userId, {
    //   privateMetadata: {
    //     stripeSubscriptionId: subscriptionId,
    //   },
    // });
  } else {
    await prisma.userSubscription.deleteMany({
      where: {
        stripeCustomerId: subscription.customer as string,
      },
    });
  }
};

const handleSubscriptionDeleted = async (subscription: Stripe.Subscription) => {
  await prisma.userSubscription.deleteMany({
    where: {
      stripeCustomerId: subscription.customer as string,
    },
  });
};
