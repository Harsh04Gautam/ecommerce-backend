import mongoose from "mongoose";
import config from "config";
import logger from "./logger";

const connectDB = async () => {
  try {
    let dbURI = config.get<string>("dbURI");
    mongoose.set("strictQuery", true);
    await mongoose.connect(dbURI);
    logger.info("database connection successful");
  } catch (err) {
    logger.error("database connection failed");
    logger.error(err);
    process.exit(1);
  }
};

export default connectDB;
