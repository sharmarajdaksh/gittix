import { natsWrapper } from "./nats-wrapper";

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
};

const verifyEnvironment = () => {
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

const start = async () => {
  verifyEnvironment();

  await initializeNats();
};

start();
