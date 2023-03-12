import pino from "pino";
import pretty from "pino-pretty";
import dayjs from "dayjs";

const stream = pretty({
  colorize: true,
  ignore: "pid,hostname",
  customPrettifiers: {
    time: () => dayjs().format("DD-MM-YYYY HH:mm"),
  },
});

const logger = pino(stream);

export default logger;
