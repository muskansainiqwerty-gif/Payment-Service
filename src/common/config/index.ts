import * as dotenv from "dotenv";
dotenv.config();
export default {
  RABBITMQ_URL: process.env.RABBIT_MQ,
  JWT_SECRET: process.env.JWT_SECRET,
  TOKEN_EXPIRATION: process.env.TOKEN_EXPIRATION,
};
