import jwt, { SignOptions } from "jsonwebtoken";

import config from "../configs/config";

interface TokenPayload {
  id: string;
}

const getNewToken = (user: TokenPayload) => {
  const token = jwt.sign(
    {
      id: user.id,
    },
    config.jwtoken.secretKey as string,

    {
      expiresIn: config.jwtoken.expiresIn as SignOptions["expiresIn"],
    },
  );

  if (!token) {
    throw new Error("Token not generated");
  }
  return { token };
};

export default getNewToken;
