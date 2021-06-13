import mongoose from "mongoose";
import { app } from "./app";

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

const verifyEnvironment = () => {
  if (!process.env.JWT_KEY) {
    throw new Error("Environment variable JWT_KEY not defined");
  }
  if (!process.env.MONGO_URI) {
    throw new Error("Environment variable MONGO_URI not defined");
  }
};

const port = process.env.PORT || 3000;
app.listen(3000, async () => {
  verifyEnvironment();

  await initializeMongoDB();
  console.log(`Listening on port ${port}`);
});
