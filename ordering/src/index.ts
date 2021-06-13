import mongoose from "mongoose";
import { app } from "./app";
import { ExpirationCompleteListener } from "./events/listeners/expiration-complete-listener";
import { PaymentCreatedListener } from "./events/listeners/payment-created-listener";
import { TicketCreatedListener } from "./events/listeners/ticket-created-listener";
import { TicketUpdatedListener } from "./events/listeners/ticket-updated-listener";
import { natsWrapper } from "./nats-wrapper";

const initializeMongoDB = async () => {
  const MONGO_URI = process.env.MONGO_URI!;
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    connectTimeoutMS: 1000,
  });
  console.log("Successfully connected to mongodb");
};

const initializeNats = async () => {
  await natsWrapper.connect(
    process.env.NATS_CLUSTER_ID!,
    process.env.NATS_CLIENT_ID!,
    process.env.NATS_URL!
  );
  natsWrapper.client.on("close", () => {
    console.log("NATS connection closed");
    process.exit();
  });

  process.on("SIGINT", () => {
    natsWrapper.client.close();
  });

  process.on("SIGTERM", () => {
    natsWrapper.client.close();
  });

  new TicketCreatedListener(natsWrapper.client).listen();
  new TicketUpdatedListener(natsWrapper.client).listen();
  new ExpirationCompleteListener(natsWrapper.client).listen();
  new PaymentCreatedListener(natsWrapper.client).listen();
};

const verifyEnvironment = () => {
  if (!process.env.JWT_KEY) {
    throw new Error("Environment variable JWT_KEY not defined");
  }
  if (!process.env.MONGO_URI) {
    throw new Error("Environment variable MONGO_URI not defined");
  }

  if (!process.env.NATS_CLIENT_ID) {
    throw new Error("Environment variable NATS_CLIENT_ID not defined");
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error("Environment variable NATS_CLUSTER_ID not defined");
  }
  if (!process.env.NATS_URL) {
    throw new Error("Environment variable NATS_URL not defined");
  }
};

const port = process.env.PORT || 3000;
app.listen(3000, async () => {
  verifyEnvironment();

  await initializeNats();
  await initializeMongoDB();
  console.log(`Listening on port ${port}`);
});
