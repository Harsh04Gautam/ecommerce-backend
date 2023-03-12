process.on("uncaughtException", (err) => {
  console.error("uncaughtException, shutting down server");
  console.error(err);
  process.exit(1);
});

import app from "./app";
import config from "config";
import logger from "./utils/logger";
import connectDB from "./utils/connectDB";

const port = config.get<number>("port");

const server = app.listen(port, () => {
  connectDB();
  logger.info(`server listening on port http://localhost:${port}`);
});

process.on("unhandledRejection", (err) => {
  logger.error("unhandledRejection, shutting down server");
  logger.error(err);
  server.close(() => {
    process.exit(1);
  });
});
