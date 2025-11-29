import { connect } from "nats";
import express from "express";
import mongoose from "mongoose";

const app = express();

let counter = 1;

const NATS_URL = "nats://nats-server:4222";
const SUBJECT = "orders";

async function runPublisher() {
  let nc;
  try {
    nc = await connect({ servers: NATS_URL });
    console.log(`connect successfully to ${nc.getServer()}`);

    const orderDetails = {
      eventType: "ORDER_CREATED",
      timestamp: Date.now(),
      actorType: "User",
      actorId: new mongoose.Types.ObjectId(),
      actorName: "Bassel",
      targetType: "Order",
      targetId: new mongoose.Types.ObjectId(),
      metadata: {
        items: [
          { productId: new mongoose.Types.ObjectId(), quantity: 1, cost: 100 },
          { productId: new mongoose.Types.ObjectId(), quantity: 1, cost: 100 },
        ],
      },
    };

    const dataToSend = JSON.stringify(orderDetails);
    nc.publish(SUBJECT, Buffer.from(dataToSend));
    console.log(`published: ${dataToSend}`);
    await nc.flush();
  } catch (err) {
    console.log(`could not publish: ${err}`);
  } finally {
    if (nc) {
      await nc.close();
    }
  }
}

app.get("/send", (req, res, next) => {
  runPublisher();
  res.send(`order number ${counter} sent`);
  counter++;
});

app.listen(3000, () => {
  console.log("listening on port 3000");
});
