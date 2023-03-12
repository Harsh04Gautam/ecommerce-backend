import jwt from "jsonwebtoken";
import Session from "../models/session.model";
import User, { privateFields } from "../models/user.model";
import logger from "./logger";
import _ from "lodash";

export const signJwt = async (
  user: InstanceType<typeof User>,
  type: "access" | "refresh"
): Promise<string | null> => {
  let session: InstanceType<typeof Session>;
  let payload: object;
  const expiresIn = type === "access" ? "1h" : "365d";
  const key = (
    type === "access"
      ? process.env.PRIVATE_ACCESS_KEY
      : process.env.PRIVATE_REFRESH_KEY
  ) as string;

  if (type === "refresh") {
    session =
      (await Session.findOne({ userId: user.id })) ||
      (await Session.create({ userId: user.id }));
    payload = { sessionId: session.id };
  } else payload = _.omit(user.toObject(), privateFields);

  const tokenPromise = new Promise((resolve, reject) => {
    jwt.sign(payload, key, { algorithm: "RS256", expiresIn }, (err, token) => {
      if (err || !token) reject(null);
      else resolve(token);
    });
  });

  try {
    return (await tokenPromise) as string;
  } catch (err) {
    return null;
  }
};

export const verifyJwt = async <T>(
  token: string,
  type: "access" | "refresh"
): Promise<T | null> => {
  const key = (
    type === "access"
      ? process.env.PUBLIC_ACCESS_KEY
      : process.env.PUBLIC_REFRESH_KEY
  ) as string;
  if (!key) logger.error("jwt public key is undefined");

  const decoadedPromise = new Promise((resolve, reject) => {
    jwt.verify(token, key, (err, decoded) => {
      if (err) reject(null);
      else resolve(decoded);
    });
  });

  try {
    return (await decoadedPromise) as T;
  } catch (err) {
    return null;
  }
};
